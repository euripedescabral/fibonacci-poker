import { it, expect } from "vitest";
import { harness, waitFor } from "./harness.js";
it("suspends after 15 minutes of no human activity; recovery retains vote", async () => {
  let now = Date.now();
  const h = await harness({ now: () => now });
  try {
    const c = await h.identity();
    const id = await h.create(c);
    const a = await h.join(id, c);
    await a.command({ type: "vote", payload: { value: 5 } });
    let code = 0;
    a.room.onLeave((c) => {
      code = c;
    });
    now += 900001;
    (await h.directory.room(id)).lifecycle.tick();
    await waitFor(() => code === 4002);
    const b = await h.join(id, c);
    expect(b.own.value).toBe(5);
  } finally {
    await h.close();
  }
});
it("evicts empty runtime after 30 seconds and restores durable round", async () => {
  let now = Date.now();
  const h = await harness({ now: () => now });
  try {
    const c = await h.identity(),
      id = await h.create(c);
    const a = await h.join(id, c);
    const room = await h.directory.room(id);
    const round = a.state.roundId;
    await a.room.leave();
    await waitFor(() => room.connections.members.size === 0);
    room.lifecycle.tick();
    now += 30001;
    room.lifecycle.tick();
    await new Promise((r) => setTimeout(r, 20));
    const b = await h.join(id, c);
    expect(b.state.roundId).toBe(round);
    expect(b.room.roomId).not.toBe(a.room.roomId);
  } finally {
    await h.close();
  }
});
