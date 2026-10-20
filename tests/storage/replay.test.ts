import { it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { openDatabase } from "../../apps/server/src/storage/database.js";
import { TableStore } from "../../apps/server/src/storage/tables.js";
import { joinMember } from "../../apps/server/src/storage/memberships.js";
import { executeCommand } from "../../apps/server/src/storage/commands.js";
import { commandSchema } from "../../packages/contracts/src/index.js";
it("deduplicates clear and rejects pruned/changed replay", () => {
  const db = openDatabase(":memory:");
  try {
    db.prepare("INSERT INTO identities VALUES(?,?,?,?)").run(
      "a",
      "hash",
      0,
      9999999999999,
    );
    const store = new TableStore(db);
    let s = joinMember(store, store.create(), "a", "Ana");
    const c = commandSchema.parse({
      type: "clear",
      payload: {},
      roundId: s.roundId,
      sequence: 1,
      commandId: randomUUID(),
    });
    s = executeCommand(store, s, "a", c).state;
    expect(executeCommand(store, s, "a", c).replayed).toBe(true);
    expect(() => executeCommand(store, s, "a", { ...c, sequence: 2 })).toThrow(
      "COMMAND_CONFLICT",
    );
    db.prepare("DELETE FROM command_receipts").run();
    expect(() => executeCommand(store, s, "a", c)).toThrow("ALREADY_PROCESSED");
    expect(() =>
      executeCommand(store, s, "a", {
        ...c,
        sequence: 2,
        commandId: randomUUID(),
      }),
    ).toThrow("STALE_ROUND");
  } finally {
    db.close();
  }
});
it("bounds receipts while sequence high-water prevents old reapplication", () => {
  const db = openDatabase(":memory:");
  try {
    db.prepare("INSERT INTO identities VALUES(?,?,?,?)").run(
      "a",
      "hash",
      0,
      9999999999999,
    );
    const store = new TableStore(db);
    let s = joinMember(store, store.create(), "a", "Ana");
    const first = commandSchema.parse({
      type: "vote",
      payload: { value: 5 },
      roundId: s.roundId,
      sequence: 1,
      commandId: randomUUID(),
    });
    for (let sequence = 1; sequence <= 105; sequence++)
      s = executeCommand(store, s, "a", {
        ...first,
        sequence,
        commandId: sequence === 1 ? first.commandId : randomUUID(),
      }).state;
    expect(db.prepare("SELECT count(*) n FROM command_receipts").get()).toEqual(
      { n: 100 },
    );
    expect(() => executeCommand(store, s, "a", first)).toThrow(
      "ALREADY_PROCESSED",
    );
  } finally {
    db.close();
  }
});
