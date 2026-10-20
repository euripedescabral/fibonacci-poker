import { randomBytes, randomUUID, createHash } from "node:crypto";
import { parseCookie, stringifySetCookie } from "cookie";
import type Database from "better-sqlite3";
import { AppError } from "../../../../packages/contracts/src/index.js";
export const SESSION_SECONDS = 365 * 24 * 60 * 60;
const COOKIE = "fp_session";
const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export class Sessions {
  constructor(private db: Database.Database) {}
  read(header: string | undefined, now = Date.now()): string {
    const token = parseCookie(header ?? "")[COOKIE];
    if (!token || !/^[-\w]{43}$/.test(token))
      throw new AppError("SESSION_EXPIRED");
    const row = this.db
      .prepare("SELECT id FROM identities WHERE token_hash=? AND expires_at>?")
      .get(hash(token), now) as { id: string } | undefined;
    if (!row) throw new AppError("SESSION_EXPIRED");
    return row.id;
  }
  ensure(
    header: string | undefined,
    secure: boolean,
    now = Date.now(),
  ): { id: string; cookie: string } {
    let token = parseCookie(header ?? "")[COOKIE];
    let id: string;
    try {
      id = this.read(header, now);
      this.db
        .prepare("UPDATE identities SET expires_at=? WHERE id=?")
        .run(now + SESSION_SECONDS * 1000, id);
    } catch {
      token = randomBytes(32).toString("base64url");
      id = randomUUID();
      this.db
        .prepare("INSERT INTO identities VALUES(?,?,?,?)")
        .run(id, hash(token), now, now + SESSION_SECONDS * 1000);
    }
    return {
      id,
      cookie: stringifySetCookie({
        name: COOKIE,
        value: token!,
        httpOnly: true,
        secure,
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_SECONDS,
      }),
    };
  }
}
