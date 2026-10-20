import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import {
  initialTable,
  connectMember,
  transition,
  calculateMode,
} from "../../packages/domain/src/index.js";
import {
  commandSchema,
  nameSchema,
  DECK,
  type Action,
  type Snapshot,
} from "../../packages/contracts/src/index.js";
function act(s: Snapshot, id: string, a: Action) {
  return transition(
    s,
    id,
    commandSchema.parse({
      ...a,
      roundId: s.roundId,
      commandId: randomUUID(),
      sequence: (s.members[id]?.lastSequence ?? 0) + 1,
    }),
    randomUUID(),
  );
}
function room() {
  let s = initialTable(randomUUID(), randomUUID());
  s = connectMember(s, "a", "Ana", 0);
  return connectMember(s, "b", "Bia", 0);
}
describe("round contract", () => {
  it.each(DECK)("accepts and withdraws %s", (value) => {
    let s = room();
    s = act(s, "a", { type: "vote", payload: { value } });
    expect(s.votes.a).toBe(value);
    s = act(s, "a", { type: "withdraw", payload: {} });
    expect(s.votes.a).toBeUndefined();
  });
  it("rejects unknown keys and invalid values", () => {
    expect(
      commandSchema.safeParse({
        type: "vote",
        payload: { value: 4 },
        roundId: randomUUID(),
        sequence: 1,
        commandId: randomUUID(),
      }).success,
    ).toBe(false);
    expect(
      commandSchema.safeParse({
        type: "clear",
        payload: {},
        extra: true,
        roundId: randomUUID(),
        sequence: 1,
        commandId: randomUUID(),
      }).success,
    ).toBe(false);
    expect(nameSchema.safeParse("\n").success).toBe(false);
    expect(nameSchema.parse("  Ána ")).toBe("Ána");
  });
  it("keeps original state untouched, permits observer reveal and freezes result", () => {
    const original = room();
    let s = act(original, "a", { type: "vote", payload: { value: 5 } });
    expect(original.votes).toEqual({});
    s = act(s, "b", { type: "setMode", payload: { mode: "observer" } });
    s = act(s, "b", { type: "reveal", payload: {} });
    expect(s.revealed?.result).toEqual({ kind: "mode", values: [5], count: 1 });
    const saved = s.revealed;
    s = act(s, "a", { type: "setMode", payload: { mode: "observer" } });
    expect(s.revealed).toEqual(saved);
    expect(() => act(s, "b", { type: "vote", payload: { value: 3 } })).toThrow(
      "OBSERVER_CANNOT_VOTE",
    );
  });
  it("clears and rejects delayed previous-round action", () => {
    const s = room();
    const command = commandSchema.parse({
      type: "clear",
      payload: {},
      roundId: s.roundId,
      sequence: 1,
      commandId: randomUUID(),
    });
    const next = transition(s, "a", command, randomUUID());
    expect(next.members).toHaveProperty("b");
    expect(() => transition(next, "b", command, randomUUID())).toThrow(
      "STALE_ROUND",
    );
  });
  it("rejects empty reveal, votes after reveal, and offline actions", () => {
    let s = room();
    expect(() => act(s, "a", { type: "reveal", payload: {} })).toThrow(
      "NO_VOTES",
    );
    s = act(s, "a", { type: "vote", payload: { value: "?" } });
    s = act(s, "b", { type: "reveal", payload: {} });
    expect(s.revealed?.result.kind).toBe("no-numeric-votes");
    expect(() => act(s, "a", { type: "vote", payload: { value: 3 } })).toThrow(
      "ROUND_CLOSED",
    );
    s.members.a!.connected = false;
    expect(() => act(s, "a", { type: "clear", payload: {} })).toThrow(
      "SESSION_EXPIRED",
    );
  });
  it.each([
    { votes: [3, 5, 5, 8], values: [5], count: 2 },
    { votes: [3, 3, 5, 5], values: [3, 5], count: 2 },
    { votes: [0, 1, 2], values: [0, 1, 2], count: 1 },
  ] as const)("computes mode $votes", ({ votes, values, count }) => {
    expect(calculateMode([...votes])).toEqual({
      kind: "mode",
      values: [...values],
      count,
    });
  });
});
