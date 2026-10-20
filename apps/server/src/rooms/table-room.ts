import { Room, type Client, type AuthContext } from "@colyseus/core";
import { schema, t } from "@colyseus/schema";
import {
  AppError,
  commandSchema,
  errorCode,
  type Snapshot,
} from "../../../../packages/contracts/src/index.js";
import { project, ownState } from "../../../../packages/domain/src/index.js";
import type { TableStore } from "../storage/tables.js";
import { joinMember, leaveMember } from "../storage/memberships.js";
import { executeCommand } from "../storage/commands.js";
import type { Tickets, Ticket } from "../identity/tickets.js";
import { SerialQueue } from "./queue.js";
import { Connections } from "./presence.js";
import { Limits } from "../http/limits.js";
import { Lifecycle } from "./lifecycle.js";
export const PublicSchema = schema({ json: t.string() });
export type PublicSchema = InstanceType<typeof PublicSchema>;
export interface RoomServices {
  store: TableStore;
  tickets: Tickets;
  now: () => number;
  disposed: (id: string) => void;
  afterCommit?: () => void;
}
export class TableRoom extends Room<{ state: PublicSchema }> {
  private services!: RoomServices;
  private snapshot!: Snapshot;
  readonly queue = new SerialQueue();
  readonly connections = new Connections();
  private failedAuth = new Limits();
  private reservations = new Map<string, number>();
  lifecycle!: Lifecycle;
  private limits = new Map<string, { at: number; count: number }>();
  onCreate(options: RoomServices & { tableId?: string }): void {
    if (!options.tableId) throw new AppError("TABLE_NOT_FOUND");
    this.services = options;
    this.snapshot = options.store.load(options.tableId);
    this.state = new PublicSchema();
    this.autoDispose = false;
    this.seatReservationTimeout = 60;
    this.publish();
    this.lifecycle = new Lifecycle(this, options.now);
    this.clock.setInterval(() => this.lifecycle.tick(), 1000);
    this.onMessage("sync", (client) => {
      if (this.connections.current(client)) this.sync(client);
    });
    this.onMessage("activity", (client) => {
      const id = this.connections.current(client);
      if (id) this.connections.activity.set(id, this.services.now());
    });
    this.onMessage<unknown>("command", (client, raw) => {
      void this.command(client, raw);
    });
  }
  onAuth(
    _client: Client,
    options: { ticket?: unknown },
    context: AuthContext,
  ): Ticket {
    try {
      return this.services.tickets.consume(
        options.ticket,
        this.snapshot.tableId,
      );
    } catch (error) {
      this.failedAuth.take(context.ip ?? "unknown", 10, 60000);
      throw error;
    }
  }
  async onJoin(client: Client, _options: unknown, auth: Ticket): Promise<void> {
    await this.queue.run(() => {
      this.reservations.delete(auth.id);
      const next = joinMember(
        this.services.store,
        this.snapshot,
        auth.id,
        auth.name,
        this.services.now(),
      );
      this.connections.replace(auth.id, client, this.services.now());
      this.update(next);
    });
  }
  async onLeave(client: Client): Promise<void> {
    await this.queue.run(() => {
      const id = this.connections.current(client);
      if (!id) return;
      const next = leaveMember(
        this.services.store,
        this.snapshot,
        id,
        this.services.now(),
      );
      this.connections.remove(id);
      this.limits.delete(id);
      this.update(next);
    });
  }
  private async command(client: Client, raw: unknown): Promise<void> {
    let commandId: string | undefined;
    try {
      const parsed = commandSchema.safeParse(raw);
      if (!parsed.success) throw new AppError("INVALID_INPUT");
      const command = parsed.data;
      commandId = command.commandId;
      await this.queue.run(() => {
        const id = this.connections.current(client);
        if (!id) throw new AppError("CONNECTION_REPLACED");
        const now = this.services.now();
        let bucket = this.limits.get(id);
        if (!bucket) {
          bucket = { at: now, count: 20 };
          this.limits.set(id, bucket);
        }
        bucket.count = Math.min(20, bucket.count + (now - bucket.at) / 100);
        bucket.at = now;
        if (bucket.count < 1) throw new AppError("RATE_LIMITED");
        bucket.count--;
        const applied = executeCommand(
          this.services.store,
          this.snapshot,
          id,
          command,
        );
        this.connections.activity.set(id, now);
        this.services.afterCommit?.();
        this.update(applied.state);
        client.send("ack", applied.reply);
        // Public state already reaches peers through Colyseus patches. Individual
        // actions change only the actor's private state; avoid 20 full snapshots
        // per vote. Round boundaries immediately synchronize every participant.
        if (command.type === "clear" || command.type === "reveal") this.syncAll();
        else this.sync(client);
      });
    } catch (error) {
      client.send("ack", { ok: false, commandId, code: errorCode(error) });
      if (this.connections.current(client)) this.sync(client);
    }
  }
  private update(next: Snapshot): void {
    const completed =
      !this.snapshot.completionEmitted && next.completionEmitted;
    this.snapshot = next;
    this.publish();
    if (completed)
      this.broadcast("complete", {
        roundId: next.roundId,
        eventId: next.roundId,
      });
  }
  private publish(): void {
    this.state.json = JSON.stringify(project(this.snapshot));
  }
  private sync(client: Client): void {
    const id = this.connections.current(client);
    if (id)
      client.send("sync", {
        state: project(this.snapshot),
        own: ownState(this.snapshot, id),
      });
  }
  private syncAll(): void {
    for (const client of this.connections.members.values()) this.sync(client);
  }
  async reserveIdentity(id: string): Promise<void> {
    await this.queue.run(() => {
      this.hasReservations(this.services.now());
      const ids = new Set([
        ...this.connections.members.keys(),
        ...this.reservations.keys(),
      ]);
      if (!ids.has(id) && ids.size >= 20) throw new AppError("TABLE_FULL");
      this.reservations.set(id, this.services.now() + 60000);
    });
  }
  hasReservations(now: number): boolean {
    for (const [id, until] of this.reservations)
      if (until <= now) this.reservations.delete(id);
    return this.reservations.size > 0;
  }
  get tableId(): string {
    return this.snapshot.tableId;
  }
  onDispose(): void {
    if (this.snapshot) this.services.disposed(this.tableId);
  }
}
