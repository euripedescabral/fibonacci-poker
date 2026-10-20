import { it, expect } from "vitest";
import { openDatabase } from "../../apps/server/src/storage/database.js";
import { migrate } from "../../apps/server/src/storage/migrate.js";
it("applies migration once and enables constraints", () => {
  const db = openDatabase(":memory:");
  try {
    migrate(db);
    expect(
      db.prepare("SELECT count(*) n FROM schema_migrations").get(),
    ).toEqual({ n: 1 });
    expect(db.pragma("foreign_keys", { simple: true })).toBe(1);
    expect(db.pragma("synchronous", { simple: true })).toBe(2);
    db.prepare("UPDATE schema_migrations SET checksum='changed'").run();
    expect(() => migrate(db)).toThrow("checksum");
  } finally {
    db.close();
  }
});
