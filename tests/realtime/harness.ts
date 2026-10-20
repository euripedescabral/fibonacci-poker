import { Client } from "@colyseus/sdk";
import { randomUUID } from "node:crypto";
import { start, type Options } from "../../apps/server/src/main.js";
import type {
  Action,
  OwnState,
  PublicState,
  Reply,
} from "../../packages/contracts/src/index.js";
export async function harness(options: Options = {}) {
  const app = await start({
    port: 0,
    origin: "auto",
    dbPath: ":memory:",
    ...options,
  });
  async function identity() {
    const response = await fetch(app.url + "/api/session", {
      method: "POST",
      headers: { Origin: app.origin, "Content-Type": "application/json" },
      body: "{}",
    });
    return response.headers.get("set-cookie")!.split(";")[0]!;
  }
  async function request(path: string, cookie: string, value?: unknown) {
    return fetch(app.url + path, {
      method: value === undefined ? "GET" : "POST",
      headers: {
        Origin: app.origin,
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: value === undefined ? undefined : JSON.stringify(value),
    });
  }
  async function create(cookie: string) {
    return (await (await request("/api/tables", cookie, {})).json())
      .tableId as string;
  }
  async function join(tableId: string, cookie: string, name = "Test") {
    const response = await request("/api/tables/" + tableId + "/join", cookie, {
      name,
      schemaVersion: 1,
    });
    const data = await response.json();
    if (!response.ok) throw Error(data.code);
    const room = await new Client(app.url, {
      headers: { Origin: app.origin },
    }).consumeSeatReservation<{ json: string }>(data.reservation);
    let state!: PublicState;
    let own!: OwnState;
    const frames: unknown[] = [];
    const completions: unknown[] = [];
    room.onStateChange((s) => {
      if (s.json) state = JSON.parse(s.json) as PublicState;
    });
    room.onMessage("sync", (data: { state: PublicState; own: OwnState }) => {
      frames.push(data);
      state = data.state;
      own = data.own;
    });
    room.onMessage("complete", (data) => completions.push(data));
    const replies = new Map<string, (reply: Reply) => void>();
    room.onMessage("ack", (reply: Reply) => {
      frames.push(reply);
      if (reply.commandId) replies.get(reply.commandId)?.(reply);
    });
    room.send("sync");
    await waitFor(() => !!own);
    return {
      room,
      frames,
      completions,
      get state() {
        return state;
      },
      get own() {
        return own;
      },
      async command(action: Action) {
        const commandId = randomUUID();
        const result = new Promise<Reply>((resolve) =>
          replies.set(commandId, resolve),
        );
        room.send("command", {
          ...action,
          commandId,
          roundId: state.roundId,
          sequence: own.lastSequence + 1,
        });
        const reply = await result;
        await new Promise((r) => setTimeout(r, 15));
        return reply;
      },
    };
  }
  return { ...app, identity, request, create, join };
}
export async function waitFor(check: () => boolean) {
  for (let i = 0; i < 200; i++) {
    if (check()) return;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw Error("Timed out");
}
