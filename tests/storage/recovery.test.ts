import { it, expect } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { openDatabase } from "../../apps/server/src/storage/database.js";
import { TableStore } from "../../apps/server/src/storage/tables.js";
import { joinMember } from "../../apps/server/src/storage/memberships.js";
import { executeCommand } from "../../apps/server/src/storage/commands.js";
import { commandSchema } from "../../packages/contracts/src/index.js";
it("recovers committed vote with offline presence after reopen", () => {
  const dir = mkdtempSync(join(tmpdir(), "poker-"));
  try {
    let db = openDatabase(join(dir, "db.sqlite"));
    db.prepare("INSERT INTO identities VALUES(?,?,?,?)").run(
      "a",
      "hash",
      0,
      9999999999999,
    );
    let store = new TableStore(db);
    const s = joinMember(store, store.create(), "a", "Ana");
    const c = commandSchema.parse({
      type: "vote",
      payload: { value: 13 },
      roundId: s.roundId,
      sequence: 1,
      commandId: randomUUID(),
    });
    executeCommand(store, s, "a", c);
    db.close();
    db = openDatabase(join(dir, "db.sqlite"));
    store = new TableStore(db);
    const restored = store.load(s.tableId);
    expect(restored.votes.a).toBe(13);
    expect(restored.members.a?.connected).toBe(false);
    expect(restored.roundId).toBe(s.roundId);
    expect(executeCommand(store, restored, "a", c).replayed).toBe(true);
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
it("handles an actual competing writer lock without changing state", () => {
  const dir = mkdtempSync(join(tmpdir(), "poker-busy-"));
  try {
    const path = join(dir, "db.sqlite");
    const db = openDatabase(path);
    db.prepare("INSERT INTO identities VALUES(?,?,?,?)").run(
      "a",
      "hash",
      0,
      9999999999999,
    );
    const store = new TableStore(db);
    const s = joinMember(store, store.create(), "a", "Ana");
    const other = openDatabase(path);
    db.pragma("busy_timeout=1");
    other.exec("BEGIN IMMEDIATE");
    try {
      const c = commandSchema.parse({
        type: "vote",
        payload: { value: 8 },
        roundId: s.roundId,
        sequence: 1,
        commandId: randomUUID(),
      });
      expect(() => executeCommand(store, s, "a", c)).toThrow(
        "STORAGE_UNAVAILABLE",
      );
      expect(s.votes).toEqual({});
    } finally {
      other.exec("ROLLBACK");
      other.close();
      db.close();
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
