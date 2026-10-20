import type { Client } from "@colyseus/core";
export class Connections {
  readonly members = new Map<string, Client>();
  readonly activity = new Map<string, number>();
  current(client: Client): string | undefined {
    for (const [id, c] of this.members) if (c === client) return id;
    return undefined;
  }
  replace(id: string, client: Client, now: number): void {
    const old = this.members.get(id);
    this.members.set(id, client);
    this.activity.set(id, now);
    if (old && old !== client) old.leave(4001, "CONNECTION_REPLACED");
  }
  remove(id: string): void {
    this.members.delete(id);
    this.activity.delete(id);
  }
}
