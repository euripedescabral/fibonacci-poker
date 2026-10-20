import Database from "better-sqlite3";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname } from "node:path";
import { migrate } from "./migrate.js";
export function openDatabase(path: string): Database.Database {
  if (path !== ":memory:")
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new Database(path);
  try {
    db.pragma("journal_mode=WAL");
    db.pragma("synchronous=FULL");
    db.pragma("foreign_keys=ON");
    db.pragma("busy_timeout=5000");
    migrate(db);
    if (path !== ":memory:") chmodSync(path, 0o600);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}
