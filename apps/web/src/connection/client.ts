import { Client, type Room } from "@colyseus/sdk";
import {
  ERROR_CODES,
  type Action,
  type OwnState,
  type PublicState,
  type Reply,
  type ErrorCode,
} from "../../../../packages/contracts/src/index.js";
import { envelope, retryDelay } from "./commands.js";
export type Status =
  | "connecting"
  | "live"
  | "reconnecting"
  | "disconnected"
  | "idle"
  | "replaced"
  | "CLIENT_OUTDATED";
export interface View {
  state: PublicState | null;
  own: OwnState | null;
  status: Status;
  pending: boolean;
  error: ErrorCode | null;
}
export async function api(
  path: string,
  value?: unknown,
): Promise<Record<string, unknown>> {
  const response = await fetch("/api/" + path, {
    method: value === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    signal: AbortSignal.timeout(10000),
    body: value === undefined ? undefined : JSON.stringify(value),
  });
  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok)
    throw Error(
      typeof data.code === "string" ? data.code : "STORAGE_UNAVAILABLE",
    );
  return data;
}
export class LiveClient {
  view: View = {
    state: null,
    own: null,
    status: "connecting",
    pending: false,
    error: null,
  };
  private room: Room<unknown, { json: string }> | null = null;
  private stopped = false;
  private generation = 0;
  private attempts = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private connectTimer: ReturnType<typeof setTimeout> | undefined;
  private pendingTimer: ReturnType<typeof setTimeout> | undefined;
  private pendingId: string | null = null;
  constructor(
    private tableId: string,
    private name: string | undefined,
    private changed: (view: View) => void,
    private complete: (id: string) => void,
  ) {}
  private emit(change: Partial<View>): void {
    this.view = { ...this.view, ...change };
    this.changed(this.view);
  }
  async connect(): Promise<void> {
    const generation = ++this.generation;
    this.stopped = false;
    clearTimeout(this.timer);
    clearTimeout(this.connectTimer);
    const oldRoom = this.room;
    this.room = null;
    void oldRoom?.leave();
    // Bound HTTP + socket handshake + first private synchronization together.
    this.connectTimer = setTimeout(() => {
      if (this.stopped || generation !== this.generation) return;
      this.generation++;
      const room = this.room;
      this.room = null;
      void room?.leave();
      this.emit({ error: "STORAGE_UNAVAILABLE", status: "disconnected" });
      this.schedule();
    }, 15000);
    this.emit({
      status: this.attempts ? "reconnecting" : "connecting",
      error: null,
    });
    try {
      const data = await api("tables/" + this.tableId + "/join", {
        name: this.name,
        schemaVersion: 1,
      });
      if (this.stopped || generation !== this.generation) return;
      const endpoint =
        location.origin + (location.port === "5173" ? "/colyseus" : "");
      const client = new Client(endpoint);
      const room = await client.consumeSeatReservation<{ json: string }>(
        data.reservation as Parameters<Client["consumeSeatReservation"]>[0],
      );
      if (this.stopped || generation !== this.generation) {
        await room.leave();
        return;
      }
      this.room = room;
      room.onMessage(
        "sync",
        (message: { state: PublicState; own: OwnState }) => {
          if (generation !== this.generation) return;
          if (
            !this.view.state ||
            message.state.revision >= this.view.state.revision
          ) {
            clearTimeout(this.connectTimer);
            this.attempts = 0;
            this.emit({
              state: message.state,
              own: message.own,
              status: "live",
            });
          }
        },
      );
      room.onStateChange((s) => {
        if (generation !== this.generation || !s.json) return;
        const state = JSON.parse(s.json) as PublicState;
        if (!this.view.state || state.revision >= this.view.state.revision)
          this.emit({ state });
      });
      room.onMessage("complete", (event: { eventId: string }) => {
        if (generation === this.generation) this.complete(event.eventId);
      });
      room.onMessage("ack", (reply: Reply) => {
        if (generation !== this.generation || reply.commandId !== this.pendingId) return;
        clearTimeout(this.pendingTimer);
        this.pendingId = null;
        this.emit({ pending: false, error: reply.ok ? null : reply.code });
      });
      room.onError(() => {
        if (generation === this.generation)
          this.emit({ error: "STORAGE_UNAVAILABLE" });
      });
      room.onLeave((code) => {
        if (this.stopped || generation !== this.generation) return;
        this.room = null;
        clearTimeout(this.connectTimer);
        clearTimeout(this.pendingTimer);
        this.pendingId = null;
        this.emit({
          pending: false,
          status:
            code === 4001
              ? "replaced"
              : code === 4002
                ? "idle"
                : "disconnected",
        });
        if (code !== 4001 && code !== 4002) this.schedule();
      });
      room.send("sync");
    } catch (error) {
      if (this.stopped || generation !== this.generation) return;
      clearTimeout(this.connectTimer);
      const message = error instanceof Error ? error.message : "";
      const code =
        ERROR_CODES.find((c) => c === message) ?? "STORAGE_UNAVAILABLE";
      this.emit({
        error: code,
        status: code === "CLIENT_OUTDATED" ? "CLIENT_OUTDATED" : "disconnected",
      });
      if (
        ![
          "CLIENT_OUTDATED",
          "TABLE_NOT_FOUND",
          "TABLE_FULL",
          "INVALID_INPUT",
          "SESSION_EXPIRED",
        ].includes(code)
      )
        this.schedule();
    }
  }
  private schedule(): void {
    if (this.attempts >= 6) {
      this.emit({ status: "disconnected" });
      return;
    }
    this.emit({ status: "reconnecting" });
    this.timer = setTimeout(() => {
      void this.connect();
    }, retryDelay(this.attempts++));
  }
  send(action: Action): void {
    if (
      !this.room ||
      this.view.status !== "live" ||
      this.view.pending ||
      !this.view.state ||
      !this.view.own
    )
      return;
    const command = envelope(
      this.tableId,
      this.view.state.roundId,
      this.view.own.lastSequence,
      action,
    );
    this.pendingId = command.commandId;
    this.emit({ pending: true, error: null });
    this.room.send("command", command);
    this.pendingTimer = setTimeout(() => {
      this.pendingId = null;
      this.emit({ pending: false, error: "STORAGE_UNAVAILABLE" });
      void this.room?.leave();
    }, 8000);
  }
  activity(): void {
    if (this.view.status === "idle") {
      this.retry();
      return;
    }
    if (this.view.status === "live") this.room?.send("activity");
  }
  retry(): void {
    this.attempts = 0;
    void this.connect();
  }
  stop(): void {
    this.stopped = true;
    this.generation++;
    clearTimeout(this.timer);
    clearTimeout(this.pendingTimer);
    clearTimeout(this.connectTimer);
    void this.room?.leave();
    this.room = null;
  }
}
