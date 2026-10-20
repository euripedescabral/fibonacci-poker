import type { Snapshot } from "../../../../packages/contracts/src/index.js";
import {
  connectMember,
  disconnectMember,
} from "../../../../packages/domain/src/index.js";
import type { TableStore } from "./tables.js";
export function joinMember(
  store: TableStore,
  s: Snapshot,
  id: string,
  name: string,
  now = Date.now(),
): Snapshot {
  const next = connectMember(s, id, name, now);
  store.save(next);
  return next;
}
export function leaveMember(
  store: TableStore,
  s: Snapshot,
  id: string,
  now = Date.now(),
): Snapshot {
  const next = disconnectMember(s, id, now);
  store.save(next);
  return next;
}
