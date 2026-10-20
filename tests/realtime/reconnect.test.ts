import { it, expect } from "vitest";
import { harness, waitFor } from "./harness.js";
it("replaces an older tab and restores the private vote with the same identity", async () => {
  const h = await harness();
  try {
    const c = await h.identity();
    const id = await h.create(c);
    const a = await h.join(id, c);
    await a.command({ type: "vote", payload: { value: 8 } });
    let code = 0;
    a.room.onLeave((c) => {
      code = c;
    });
    const b = await h.join(id, c);
    await waitFor(() => code === 4001);
    expect(b.own.value).toBe(8);
    expect(b.state.members.filter((m) => m.connected)).toHaveLength(1);
    expect(await b.command({ type: "clear", payload: {} })).toMatchObject({
      ok: true,
    });
  } finally {
    await h.close();
  }
});
it("enforces capacity with 20 real clients and preserves replacement/retry semantics", async () => {
  const h = await harness();
  try {
    const cookies = await Promise.all(
      Array.from({ length: 21 }, () => h.identity()),
    );
    const id = await h.create(cookies[0]!);
    const people = [];
    for (let i = 0; i < 20; i++)
      people.push(await h.join(id, cookies[i]!, `Person ${i}`));
    await expect(h.join(id, cookies[20]!)).rejects.toThrow("TABLE_FULL");
    const replaced = people[0]!;
    let leaveCode = 0;
    replaced.room.onLeave((code) => {
      leaveCode = code;
    });
    const replacement = await h.join(id, cookies[0]!);
    await waitFor(() => leaveCode === 4001);
    expect(replacement.state.members.filter((m) => m.connected)).toHaveLength(
      20,
    );
    await replacement.room.leave();
    const live = await h.directory.room(id);
    await waitFor(() => live.connections.members.size === 19);
    await h.join(id, cookies[20]!);
    await expect(h.join(id, cookies[0]!)).rejects.toThrow("TABLE_FULL");
    expect(live.connections.members.size).toBe(20);
  } finally {
    await h.close();
  }
}, 15000);
