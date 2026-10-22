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
    const lateCookie = await h.identity();
    const late = await h.join(id, lateCookie, "Late");
    expect(await late.command({ type: "vote", payload: { value: 13 } })).toMatchObject({ ok: true });
    await waitFor(() => one.state.revealed?.cards.length === 2);
    expect(one.state.revealed?.result).toEqual({ kind: "mode", values: [13], count: 2 });
    const roundId = one.state.roundId;
    await two.command({ type: "setMode", payload: { mode: "observer" } });
    expect(await two.command({ type: "hide", payload: {} })).toMatchObject({ ok: true });
    await waitFor(() => one.state.phase === "open" && late.state.phase === "open");
    expect(one.state.roundId).toBe(roundId);
    expect(one.own.value).toBe(13);
    expect(one.state.revealed).toBeNull();
    two.frames.length = 0;
    await one.command({ type: "vote", payload: { value: 34 } });
    expect(JSON.stringify(two.frames)).not.toContain('"value":34');
    expect(two.state.revealed).toBeNull();
    await two.command({ type: "reveal", payload: {} });
    await waitFor(() => one.state.phase === "revealed");
    expect(one.state.revealed?.result).toEqual({ kind: "mode", values: [13, 34], count: 1 });

  } finally {
    await h.close();
  }
});
