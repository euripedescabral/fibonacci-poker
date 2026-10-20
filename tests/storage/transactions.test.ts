import { it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { openDatabase } from "../../apps/server/src/storage/database.js";
import { TableStore } from "../../apps/server/src/storage/tables.js";
import { joinMember } from "../../apps/server/src/storage/memberships.js";
import { executeCommand } from "../../apps/server/src/storage/commands.js";
import { commandSchema } from "../../packages/contracts/src/index.js";
it("rolls back failed writes and never changes caller state", () => {
  const db = openDatabase(":memory:");
  try {
    db.prepare("INSERT INTO identities VALUES(?,?,?,?)").run(
      "a",
      "hash",
      0,
      9999999999999,
    );
    const store = new TableStore(db);
    const s = joinMember(store, store.create(), "a", "Ana");
    const c = commandSchema.parse({
      type: "vote",
      payload: { value: 8 },
      roundId: s.roundId,
      sequence: 1,
      commandId: randomUUID(),
    });
    expect(() =>
      executeCommand(store, s, "a", c, () => {
        throw Error("disk failure");
      }),
    ).toThrow("STORAGE_UNAVAILABLE");
    expect(store.load(s.tableId).votes).toEqual({});
    expect(s.votes).toEqual({});
    const result = executeCommand(store, s, "a", c);
    expect(result.state.votes.a).toBe(8);
    expect(store.load(s.tableId).votes.a).toBe(8);
  } finally {
    db.close();
  }
});
it("rejects a real SQLite read-only write without acknowledging", () => {
  const db = openDatabase(":memory:");
  try {
    db.prepare("INSERT INTO identities VALUES(?,?,?,?)").run(
      "a",
      "hash",
      0,
      9999999999999,
    );
    const store = new TableStore(db);
    const s = joinMember(store, store.create(), "a", "Ana");
    const c = commandSchema.parse({
      type: "vote",
      payload: { value: 8 },
      roundId: s.roundId,
      sequence: 1,
      commandId: randomUUID(),
    });
    db.pragma("query_only=ON");
    expect(() => executeCommand(store, s, "a", c)).toThrow(
      "STORAGE_UNAVAILABLE",
    );
    expect(store.load(s.tableId).votes).toEqual({});
    expect(s.revision).toBe(1);
  } finally {
    db.close();
  }
});
