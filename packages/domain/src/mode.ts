import type { Vote, ModeResult } from "../../contracts/src/index.js";
export function calculateMode(votes: Vote[]): ModeResult {
  const counts = new Map<number, number>();
  for (const value of votes)
    if (typeof value === "number")
      counts.set(value, (counts.get(value) ?? 0) + 1);
  if (!counts.size) return { kind: "no-numeric-votes" };
  const count = Math.max(...counts.values());
  return {
    kind: "mode",
    values: [...counts]
      .filter(([, n]) => n === count)
      .map(([v]) => v)
      .sort((a, b) => a - b),
    count,
  };
}
