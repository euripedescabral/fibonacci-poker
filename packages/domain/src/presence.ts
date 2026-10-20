import {
  AppError,
  MAX_PEOPLE,
  type Snapshot,
} from "../../contracts/src/index.js";
export function checkCompletion(state: Snapshot): boolean {
  const voters = Object.values(state.members).filter(
    (m) => m.connected && m.mode === "voter",
  );
  if (
    state.phase !== "open" ||
    state.completionEmitted ||
    !voters.length ||
    voters.some((m) => state.votes[m.id] === undefined)
  )
    return false;
  state.completionEmitted = true;
  return true;
}
export function connectMember(
  state: Snapshot,
  id: string,
  name: string,
  now: number,
): Snapshot {
  const next = structuredClone(state);
  const active = Object.values(next.members).filter(
    (m) => m.connected && m.id !== id,
  );
  if (active.length >= MAX_PEOPLE) throw new AppError("TABLE_FULL");
  const old = next.members[id];
  const used = new Set(active.map((m) => m.seat));
  let seat = old?.seat ?? 0;
  if (used.has(seat)) seat = 0;
  while (used.has(seat)) seat++;
  next.members[id] = {
    id,
    name,
    mode: old?.mode ?? "voter",
    seat,
    connected: true,
    lastSequence: old?.lastSequence ?? 0,
    lastSeen: now,
  };
  next.revision++;
  checkCompletion(next);
  return next;
}
export function disconnectMember(
  state: Snapshot,
  id: string,
  now: number,
): Snapshot {
  const next = structuredClone(state);
  const member = next.members[id];
  if (member) {
    member.connected = false;
    member.lastSeen = now;
    next.revision++;
    checkCompletion(next);
  }
  return next;
}
