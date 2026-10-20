import type {
  Action,
  Command,
} from "../../../../packages/contracts/src/index.js";
export function envelope(
  tableId: string,
  roundId: string,
  accepted: number,
  action: Action,
): Command {
  let stored = 0;
  try {
    stored = Number(localStorage.getItem("fp:sequence:" + tableId)) || 0;
  } catch {
    /* Cookie and server remain authoritative. */
  }
  const sequence =
    Math.max(accepted, Number.isSafeInteger(stored) ? stored : 0) + 1;
  try {
    localStorage.setItem("fp:sequence:" + tableId, String(sequence));
  } catch {
    /* Recover high-water mark from server on join. */
  }
  return {
    ...action,
    commandId: crypto.randomUUID(),
    roundId,
    sequence,
  } as Command;
}
export function retryDelay(attempt: number): number {
  return Math.min(30000, 1000 * 2 ** attempt) + Math.random() * 300;
}
