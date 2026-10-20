import { it, expect } from "vitest";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { openDatabase } from "../../apps/server/src/storage/database.js";
import { Sessions } from "../../apps/server/src/identity/session.js";
import { backup } from "../../ops/backup.mjs";
import { restore } from "../../ops/restore.mjs";
import { deleteIdentity } from "../../ops/privacy.mjs";
it("backs up live WAL, authenticates encryption and replays later deletions", async () => {
  const dir = mkdtempSync(join(tmpdir(), "poker-backup-"));
  const path = join(dir, "live.sqlite"),
    key = join(dir, "key"),
    ledger = join(dir, "ledger"),
    archive = join(dir, "backup.enc");
  const db = openDatabase(path);
  try {
    writeFileSync(key, randomBytes(32), { mode: 0o600 });
    writeFileSync(ledger, "", { mode: 0o600 });
    const identity = new Sessions(db).ensure(undefined, false);
    await backup(path, archive, key);
    expect(readFileSync(archive).includes(Buffer.from(identity.id))).toBe(
      false,
    );
    expect(statSync(archive).mode & 0o777).toBe(0o600);
    deleteIdentity(db, identity.id, ledger);
    const target = join(dir, "restored.sqlite");
    restore(archive, target, key, ledger);
    const restored = openDatabase(target);
    expect(
      restored.prepare("SELECT count(*) AS n FROM identities").get(),
    ).toEqual({ n: 0 });
    restored.close();
    expect(() => restore(archive, target, key, ledger)).toThrow("fresh target");
    const damaged = readFileSync(archive);
    damaged[damaged.length - 1] = damaged[damaged.length - 1]! ^ 1;
    writeFileSync(join(dir, "damaged"), damaged);
    expect(() =>
      restore(join(dir, "damaged"), join(dir, "bad.sqlite"), key, ledger),
    ).toThrow();
    expect(() =>
      restore(
        archive,
        join(dir, "missing-ledger.sqlite"),
        key,
        join(dir, "missing"),
      ),
    ).toThrow("ledger required");
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
it("rejects corrupted off-host readback and prunes only expired database objects", async () => {
  const { uploadVerified, pruneRemote } = await import("../../ops/offhost.mjs");
  const {
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
  } = await import("@aws-sdk/client-s3");
  const bytes = Buffer.from("encrypted fixture");
  const deleted: string[] = [];
  const client = {
    async send(command: unknown): Promise<unknown> {
      if (command instanceof PutObjectCommand) return {};
      if (command instanceof GetObjectCommand)
        return {
          Body: { transformToByteArray: async () => Buffer.from("corrupt") },
        };
      if (command instanceof ListObjectsV2Command)
        return {
          Contents: [
            { Key: "backups/poker-old.enc", LastModified: new Date(0) },
            { Key: "backups/poker-recent.enc", LastModified: new Date() },
            { Key: "deletions.enc", LastModified: new Date(0) },
          ],
        };
      if (command instanceof DeleteObjectCommand) {
        deleted.push(command.input.Key!);
        return {};
      }
      throw Error("Unexpected command");
    },
  };
  await expect(
    uploadVerified(client, "private-fixture", "backups/poker-test.enc", bytes),
  ).rejects.toThrow("round-trip");
  await pruneRemote(client, "private-fixture");
  expect(deleted).toEqual(["backups/poker-old.enc"]);
});
