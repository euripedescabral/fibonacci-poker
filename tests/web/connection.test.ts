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

it('stops automatic recovery after six retries and permits an explicit retry', async () => {
  const { LiveClient } = await import('../../apps/web/src/connection/client.js');
  vi.useFakeTimers();
  const fetcher = vi.fn().mockRejectedValue(new TypeError('offline fixture'));
  vi.stubGlobal('fetch', fetcher);
  const client = new LiveClient('table', 'Fixture', () => undefined, () => undefined);
  try {
    await client.connect();
    await vi.runAllTimersAsync();
    expect(fetcher).toHaveBeenCalledTimes(7);
    expect(client.view.status).toBe('disconnected');
    client.retry();
    await Promise.resolve();
    expect(fetcher).toHaveBeenCalledTimes(8);
  } finally {
    client.stop(); vi.useRealTimers(); vi.unstubAllGlobals();
  }
});
