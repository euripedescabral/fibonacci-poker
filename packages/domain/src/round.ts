import {
  AppError,
  type Command,
  type Snapshot,
} from "../../contracts/src/index.js";
import { calculateMode } from "./mode.js";
import { checkCompletion } from "./presence.js";
export function initialTable(tableId: string, roundId: string): Snapshot {
  return {
    tableId,
    roundId,
    revision: 0,
    phase: "open",
    suit: "ember",
    completionEmitted: false,
    members: {},
    votes: {},
    revealed: null,
  };
}
export function transition(
  state: Snapshot,
  id: string,
  command: Command,
  nextRoundId: string,
): Snapshot {
  const current = state.members[id];
  if (!current?.connected) throw new AppError("SESSION_EXPIRED");
  if (command.roundId !== state.roundId) throw new AppError("STALE_ROUND");
  const next = structuredClone(state);
  const member = next.members[id]!;
  switch (command.type) {
    case "vote":
    case "withdraw":
      if (member.mode !== "voter") throw new AppError("OBSERVER_CANNOT_VOTE");
      if (state.phase !== "open") throw new AppError("ROUND_CLOSED");
      if (command.type === "vote") next.votes[id] = command.payload.value;
      else delete next.votes[id];
      break;
    case "setMode":
      member.mode = command.payload.mode;
      if (member.mode === "observer" && state.phase === "open")
        delete next.votes[id];
      break;
    case "setSuit":
      next.suit = command.payload.suit;
      break;
    case "reveal":
      if (!Object.keys(next.votes).length) throw new AppError("NO_VOTES");
      if (next.phase === "open") {
        next.phase = "revealed";
        next.revealed = {
          cards: Object.entries(next.votes).map(([key, value]) => ({
            id: key,
            name: next.members[key]!.name,
            value,
            offline: !next.members[key]!.connected,
          })),
          result: calculateMode(Object.values(next.votes)),
        };
      }
      break;
    case "clear":
      next.roundId = nextRoundId;
      next.phase = "open";
      next.votes = {};
      next.revealed = null;
      next.completionEmitted = false;
      break;
  }
  next.revision++;
  member.lastSequence = command.sequence;
  checkCompletion(next);
  return next;
}
