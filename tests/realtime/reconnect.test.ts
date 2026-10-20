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
