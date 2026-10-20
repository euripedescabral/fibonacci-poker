import { expect, it, vi } from "vitest";
import {
  envelope,
  retryDelay,
} from "../../apps/web/src/connection/commands.js";
it("reconciles stored sequence with server and survives blocked storage", () => {
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw Error("blocked");
    },
    setItem: () => {
      throw Error("blocked");
    },
  });
  expect(
    envelope("table", "round", 41, { type: "clear", payload: {} }),
  ).toMatchObject({ sequence: 42, roundId: "round" });
  vi.unstubAllGlobals();
});
it("caps reconnect backoff at 30s plus jitter", () => {
  for (let i = 0; i < 10; i++) expect(retryDelay(i)).toBeLessThan(30301);
  expect(retryDelay(0)).toBeGreaterThanOrEqual(1000);
});

it("stops automatic recovery after six retries and permits an explicit retry", async () => {
  const { LiveClient } =
    await import("../../apps/web/src/connection/client.js");
  vi.useFakeTimers();
  const fetcher = vi.fn().mockRejectedValue(new TypeError("offline fixture"));
  vi.stubGlobal("fetch", fetcher);
  const client = new LiveClient(
    "table",
    "Fixture",
    () => undefined,
    () => undefined,
  );
  try {
    await client.connect();
    await vi.runAllTimersAsync();
    expect(fetcher).toHaveBeenCalledTimes(7);
    expect(client.view.status).toBe("disconnected");
    client.retry();
    await Promise.resolve();
    expect(fetcher).toHaveBeenCalledTimes(8);
  } finally {
    client.stop();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});
it("drops an unacknowledged vote on disconnect and reconciles a different round", async () => {
  vi.resetModules();
  vi.useFakeTimers();
  const rooms: {
    messages: Map<string, (value: unknown) => void>;
    leaveCallback: (code: number) => void;
    send: ReturnType<typeof vi.fn>;
  }[] = [];
  vi.doMock("@colyseus/sdk", () => ({
    Client: class {
      async consumeSeatReservation() {
        const room = {
          messages: new Map<string, (value: unknown) => void>(),
          leaveCallback: (_code: number) => {},
          send: vi.fn(),
          onMessage(name: string, callback: (value: unknown) => void) {
            this.messages.set(name, callback);
          },
          onStateChange: vi.fn(),
          onError: vi.fn(),
          onLeave(callback: (code: number) => void) {
            this.leaveCallback = callback;
          },
          leave: vi.fn(),
        };
        rooms.push(room);
        return room;
      }
    },
  }));
  vi.stubGlobal("location", { origin: "http://localhost:3000", port: "3000" });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ reservation: {} }))),
  );
  const { LiveClient } =
    await import("../../apps/web/src/connection/client.js");
  const { initialTable, project } =
    await import("../../packages/domain/src/index.js");
  const { randomUUID } = await import("node:crypto");
  const state = project(initialTable(randomUUID(), randomUUID()));
  const own = {
    id: randomUUID(),
    roundId: state.roundId,
    lastSequence: 0,
    value: null,
  };
  const client = new LiveClient(
    state.tableId,
    "Fixture",
    () => {},
    () => {},
  );
  try {
    await client.connect();
    rooms[0]!.messages.get("sync")!({ state, own });
    client.send({ type: "vote", payload: { value: 8 } });
    expect(client.view.pending).toBe(true);
    rooms[0]!.leaveCallback(1006);
    expect(client.view.pending).toBe(false);
    await vi.advanceTimersByTimeAsync(1500);
    expect(rooms).toHaveLength(2);
    const next = {
      ...state,
      revision: state.revision + 1,
      roundId: randomUUID(),
    };
    rooms[1]!.messages.get("sync")!({
      state: next,
      own: { ...own, roundId: next.roundId },
    });
    expect(client.view.status).toBe("live");
    expect(client.view.own?.value).toBeNull();
    expect(
      rooms[0]!.send.mock.calls.filter(([type]) => type === "command"),
    ).toHaveLength(1);
    expect(
      rooms[1]!.send.mock.calls.filter(([type]) => type === "command"),
    ).toHaveLength(0);
    expect(client.view.state?.roundId).toBe(next.roundId);
  } finally {
    client.stop();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.doUnmock("@colyseus/sdk");
    vi.resetModules();
  }
});
