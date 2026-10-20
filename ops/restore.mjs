import Database from "better-sqlite3";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  renameSync,
  rmSync,
  mkdirSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { replayDeletions } from "./privacy.mjs";
import { decrypt } from "./backup.mjs";
export function restore(source, target, keyFile, ledger) {
  if (
    existsSync(target) ||
    existsSync(target + "-wal") ||
    existsSync(target + "-shm")
  )
    throw Error("Restore requires a fresh target; preserve the old database");
  const plain = decrypt(readFileSync(source), keyFile);
  mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
  const temp = target + ".restore";
  writeFileSync(temp, plain, { mode: 0o600, flag: "wx", flush: true });
  try {
    const db = new Database(temp);
    try {
      db.pragma("foreign_keys=ON");
      if (db.pragma("integrity_check", { simple: true }) !== "ok")
        throw Error("Restore integrity failed");
      replayDeletions(db, ledger);
      if (db.pragma("foreign_key_check").length)
        throw Error("Restore foreign key failure");
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.pragma("journal_mode=DELETE");
    } finally {
      db.close();
    }
    renameSync(temp, target);
  } catch (error) {
    rmSync(temp, { force: true });
    throw error;
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  if (process.env.APP_STOPPED !== "true")
    throw Error("Stop app before restore");
  restore(
    process.argv[2],
    process.env.RESTORE_PATH,
    process.env.BACKUP_KEY_FILE,
    process.env.DELETION_LEDGER,
  );
  console.log("restore_ok");
}
