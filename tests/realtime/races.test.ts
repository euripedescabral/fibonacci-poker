import { it, expect } from "vitest";
import { harness } from "./harness.js";
it("coalesces cold wakeups and serializes votes and competing clears", async () => {
  const h = await harness();
  try {
    const c = await h.identity(),
      d = await h.identity(),
      id = await h.create(c);
    const [a, b] = await Promise.all([h.join(id, c), h.join(id, d)]);
    expect(a.room.roomId).toBe(b.room.roomId);
    const votes = await Promise.all([
      a.command({ type: "vote", payload: { value: 5 } }),
      b.command({ type: "vote", payload: { value: 8 } }),
    ]);
    expect(votes.every((v) => v.ok)).toBe(true);
    const clears = await Promise.all([
      a.command({ type: "clear", payload: {} }),
      b.command({ type: "clear", payload: {} }),
    ]);
    expect(clears.filter((v) => v.ok)).toHaveLength(1);
    expect(clears.find((v) => !v.ok)).toMatchObject({ code: "STALE_ROUND" });
  } finally {
    await h.close();
  }
});
it("reserves exactly 20 identities, allows replacement and bounds active rooms", async () => {
  const h = await harness({ maxTables: 1 });
  try {
    const c = await h.identity(),
      id = await h.create(c);
    const room = await h.directory.room(id);
    const results = await Promise.allSettled(
      Array.from({ length: 21 }, (_, i) =>
        room.reserveIdentity("identity-" + i),
      ),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(20);
    await expect(room.reserveIdentity("identity-0")).resolves.toBeUndefined();
    const other = await h.create(c);
    await expect(h.directory.wake(other)).rejects.toMatchObject({
      code: "SERVER_BUSY",
    });
  } finally {
    await h.close();
  }
});
it("accepts simultaneous vote and reveal and subsequent edits", async () => {
  const h = await harness();
  try {
    const ca = await h.identity(),
      cb = await h.identity();
    const id = await h.create(ca);
    const a = await h.join(id, ca),
      b = await h.join(id, cb);
    await a.command({ type: "vote", payload: { value: 3 } });
    const [vote, reveal] = await Promise.all([
      b.command({ type: "vote", payload: { value: 8 } }),
      a.command({ type: "reveal", payload: {} }),
    ]);
    expect(reveal.ok).toBe(true);
    expect(vote.ok).toBe(true);
    expect(h.store.load(id).revealed?.cards).toHaveLength(2);
    expect(await b.command({ type: "vote", payload: { value: 13 } })).toMatchObject({ ok: true });
    expect(h.store.load(id).revealed?.result).toEqual({ kind: "mode", values: [3, 13], count: 1 });
  } finally {
    await h.close();
  }
});
