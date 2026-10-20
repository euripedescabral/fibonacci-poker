import { it, expect } from "vitest";
import { harness, waitFor } from "./harness.js";
it("real SDK clients receive only their own hidden vote before reveal", async () => {
  const h = await harness();
  try {
    const a = await h.identity(),
      b = await h.identity();
    const id = await h.create(a);
    const one = await h.join(id, a, "One"),
      two = await h.join(id, b, "Two");
    expect(
      await one.command({ type: "vote", payload: { value: 13 } }),
    ).toMatchObject({ ok: true });
    await waitFor(() => two.state.submitted === 1);
    expect(two.state.revealed).toBeNull();
    expect(two.own.value).toBeNull();
    expect(JSON.stringify(two.frames)).not.toContain('"value":13');
    expect(one.own.value).toBe(13);
    await two.command({ type: "reveal", payload: {} });
    await waitFor(() => one.state.phase === "revealed");
    expect(one.state.revealed?.cards[0]).toMatchObject({
      name: "One",
      value: 13,
    });
  } finally {
    await h.close();
  }
});
