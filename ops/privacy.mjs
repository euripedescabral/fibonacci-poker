import Database from "better-sqlite3";
import {
  appendFileSync,
  chmodSync,
  existsSync,
  readFileSync,
  mkdirSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
const identityPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function exportIdentity(db, id) {
  const revealed = [];
  for (const row of db
    .prepare(
      "SELECT table_id,revealed_snapshot_json FROM tables WHERE revealed_snapshot_json IS NOT NULL",
    )
    .all()) {
    const cards = JSON.parse(row.revealed_snapshot_json).cards.filter(
      (card) => card.id === id,
    );
    if (cards.length) revealed.push({ tableId: row.table_id, cards });
  }
  return {
    identity:
      db
        .prepare("SELECT id,created_at,expires_at FROM identities WHERE id=?")
        .get(id) ?? null,
    memberships: db
      .prepare("SELECT * FROM memberships WHERE identity_id=?")
      .all(id),
    votes: db.prepare("SELECT * FROM votes WHERE identity_id=?").all(id),
    revealed,
  };
}
export function redact(db, id) {
  db.transaction(() => {
    for (const row of db
      .prepare(
        "SELECT table_id,revealed_snapshot_json FROM tables WHERE revealed_snapshot_json IS NOT NULL",
      )
      .all()) {
      const snapshot = JSON.parse(row.revealed_snapshot_json);
      if (!snapshot.cards.some((card) => card.id === id)) continue;
      snapshot.cards = snapshot.cards.filter((card) => card.id !== id);
      const counts = new Map();
      for (const card of snapshot.cards) {
        if (typeof card.value === "number")
          counts.set(card.value, (counts.get(card.value) ?? 0) + 1);
      }
      const count = Math.max(0, ...counts.values());
      snapshot.result = count
        ? {
            kind: "mode",
            values: [...counts]
              .filter(([, n]) => n === count)
              .map(([value]) => value)
              .sort((a, b) => a - b),
            count,
          }
        : { kind: "no-numeric-votes" };
      db.prepare(
        "UPDATE tables SET revealed_snapshot_json=?,revision=revision+1 WHERE table_id=?",
      ).run(JSON.stringify(snapshot), row.table_id);
    }
    db.prepare("DELETE FROM identities WHERE id=?").run(id);
  }).immediate();
}
export function deleteIdentity(db, id, ledger) {
  if (!identityPattern.test(id)) throw Error("Invalid identity");
  mkdirSync(dirname(ledger), { recursive: true, mode: 0o700 });
  // Write ahead of SQL: replay repairs a crash between recording and erasure.
  appendFileSync(
    ledger,
    JSON.stringify({ id, at: new Date().toISOString() }) + "\n",
    { mode: 0o600, flush: true },
  );
  chmodSync(ledger, 0o600);
  redact(db, id);
}
export function replayDeletions(db, ledger) {
  if (!existsSync(ledger))
    throw Error("Deletion ledger required, including when empty");
  for (const line of readFileSync(ledger, "utf8").split("\n").filter(Boolean)) {
    const entry = JSON.parse(line);
    if (!identityPattern.test(entry.id)) throw Error("Invalid deletion ledger");
    redact(db, entry.id);
  }
}
export function expireIdentities(db, ledger, now = Date.now()) {
  const rows = db
    .prepare("SELECT id FROM identities WHERE expires_at<=?")
    .all(now);
  for (const { id } of rows) deleteIdentity(db, id, ledger);
  return rows.length;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  if (process.env.APP_STOPPED !== "true")
    throw Error("Stop the app before privacy maintenance");
  const db = new Database(process.env.DB_PATH, { fileMustExist: true });
  db.pragma("foreign_keys=ON");
  try {
    const [action, id] = process.argv.slice(2);
    if (action === "export")
      process.stdout.write(JSON.stringify(exportIdentity(db, id)));
    else if (action === "delete")
      deleteIdentity(db, id, process.env.DELETION_LEDGER);
    else if (action === "expire")
      expireIdentities(db, process.env.DELETION_LEDGER);
    else throw Error("Use export, delete or expire");
  } finally {
    db.close();
  }
}
