import { it, expect } from "vitest";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDatabase } from "../../apps/server/src/storage/database.js";
import { Sessions } from "../../apps/server/src/identity/session.js";
import { TableStore } from "../../apps/server/src/storage/tables.js";
import { joinMember } from "../../apps/server/src/storage/memberships.js";
import {
  deleteIdentity,
  exportIdentity,
  expireIdentities,
  replayDeletions,
} from "../../ops/privacy.mjs";
it("exports only the requested identity and erases votes, receipts and frozen names", () => {
  const dir = mkdtempSync(join(tmpdir(), "poker-privacy-")),
    ledger = join(dir, "ledger");
  const db = openDatabase(":memory:");
  try {
    const sessions = new Sessions(db),
      a = sessions.ensure(undefined, false, 100),
      b = sessions.ensure(undefined, false);
    const store = new TableStore(db);
    let state = joinMember(store, store.create(), a.id, "Private name");
    state = joinMember(store, state, b.id, "Other person");
    state.votes = { [a.id]: 8, [b.id]: 3 };
    state.phase = "revealed";
    state.revealed = {
      cards: [
        { id: a.id, name: "Private name", value: 8, offline: false },
        { id: b.id, name: "Other person", value: 3, offline: false },
      ],
      result: { kind: "mode", values: [3, 8], count: 1 },
    };
    store.save(state);
    const exported = JSON.stringify(exportIdentity(db, a.id));
    expect(exported).toContain("Private name");
    expect(exported).not.toContain("Other person");
    expect(exported).not.toContain("token_hash");
    deleteIdentity(db, a.id, ledger);
    replayDeletions(db, ledger);
    const clean = store.load(state.tableId);
    expect(clean.votes).toEqual({ [b.id]: 3 });
    expect(clean.revealed?.cards.map((c) => c.name)).toEqual(["Other person"]);
    expect(clean.revealed?.result).toEqual({
      kind: "mode",
      values: [3],
      count: 1,
    });
    expect(readFileSync(ledger, "utf8")).toContain(a.id);
    expect(expireIdentities(db, ledger, Date.now() + 366 * 86400000)).toBe(1);
    expect(store.load(state.tableId).members).toEqual({});
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
