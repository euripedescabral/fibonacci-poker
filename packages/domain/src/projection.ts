import type {
  Snapshot,
  PublicState,
  OwnState,
} from "../../contracts/src/index.js";
export function project(state: Snapshot): PublicState {
  const members = Object.values(state.members)
    .filter((m) => m.connected || state.votes[m.id] !== undefined)
    .map((m) => ({
      id: m.id,
      name: m.name,
      mode: m.mode,
      connected: m.connected,
      seat: m.seat,
      hasVoted: state.votes[m.id] !== undefined,
    }));
  const active = members.filter((m) => m.connected && m.mode === "voter");
  return {
    tableId: state.tableId,
    roundId: state.roundId,
    revision: state.revision,
    phase: state.phase,
    suit: state.suit,
    members,
    activeVoters: active.length,
    voted: active.filter((m) => m.hasVoted).length,
    submitted: Object.keys(state.votes).length,
    revealed:
      state.phase === "revealed" ? structuredClone(state.revealed) : null,
  };
}
export function ownState(state: Snapshot, id: string): OwnState {
  return {
    id,
    roundId: state.roundId,
    value: state.votes[id] ?? null,
    lastSequence: state.members[id]?.lastSequence ?? 0,
  };
}
