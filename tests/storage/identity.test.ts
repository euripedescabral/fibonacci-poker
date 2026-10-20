import { it, expect } from "vitest";
import { openDatabase } from "../../apps/server/src/storage/database.js";
import { Sessions } from "../../apps/server/src/identity/session.js";
import { Tickets } from "../../apps/server/src/identity/tickets.js";
it("keeps only a hash and restores identity with HttpOnly cookie", () => {
  const db = openDatabase(":memory:");
  try {
    const sessions = new Sessions(db);
    const s = sessions.ensure(undefined, true, 1000);
    const cookie = s.cookie.split(";")[0]!;
    expect(s.cookie).toContain("HttpOnly");
    expect(s.cookie).toContain("Secure");
    expect(s.cookie).toContain("SameSite=Strict");
    expect(sessions.read(cookie, 1001)).toBe(s.id);
    expect(sessions.ensure(cookie, true, 2000).id).toBe(s.id);
    expect(
      JSON.stringify(db.prepare("SELECT * FROM identities").all()),
    ).not.toContain(cookie.split("=")[1]);
    expect(() => sessions.read("fp_session=" + s.id, 2000)).toThrow(
      "SESSION_EXPIRED",
    );
    expect(() => sessions.read(cookie, 9999999999999)).toThrow(
      "SESSION_EXPIRED",
    );
  } finally {
    db.close();
  }
});
it("tickets expire, are one-use, and cannot cross rooms", () => {
  const tickets = new Tickets();
  let t = tickets.issue("a", "table", "Ana", 0);
  expect(() => tickets.consume(t, "other", 1)).toThrow("SESSION_EXPIRED");
  t = tickets.issue("a", "table", "Ana", 0);
  expect(tickets.consume(t, "table", 1).id).toBe("a");
  expect(() => tickets.consume(t, "table", 2)).toThrow("SESSION_EXPIRED");
  t = tickets.issue("a", "table", "Ana", 0);
  expect(() => tickets.consume(t, "table", 60000)).toThrow("SESSION_EXPIRED");
});
