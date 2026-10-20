import Database from "better-sqlite3";
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHash,
} from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  renameSync,
  chmodSync,
  readdirSync,
  statSync,
  mkdtempSync,
} from "node:fs";
import { dirname, resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
export function encrypt(bytes, keyFile) {
  const key = readFileSync(keyFile);
  if (key.length !== 32) throw Error("Backup key must be 32 bytes");
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
  return Buffer.concat([
    Buffer.from("FPB1"),
    iv,
    cipher.getAuthTag(),
    ciphertext,
  ]);
}
export function decrypt(bytes, keyFile) {
  if (bytes.length < 32 || bytes.subarray(0, 4).toString() !== "FPB1")
    throw Error("Unsupported backup");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    readFileSync(keyFile),
    bytes.subarray(4, 16),
  );
  decipher.setAuthTag(bytes.subarray(16, 32));
  return Buffer.concat([decipher.update(bytes.subarray(32)), decipher.final()]);
}
export async function backup(source, target, keyFile) {
  mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
  const scratch = mkdtempSync(join(dirname(target), ".snapshot-"));
  const temp = join(scratch, "snapshot.sqlite");
  const db = new Database(source, { readonly: true, fileMustExist: true });
  try {
    await db.backup(temp);
    chmodSync(temp, 0o600);
    const check = new Database(temp, { readonly: true });
    try {
      if (check.pragma("integrity_check", { simple: true }) !== "ok")
        throw Error("Backup integrity failed");
    } finally {
      check.close();
    }
    const file = encrypt(readFileSync(temp), keyFile);
    const staged = join(scratch, "encrypted");
    writeFileSync(staged, file, { mode: 0o600, flush: true });
    renameSync(staged, target);
    return {
      bytes: file.length,
      sha256: createHash("sha256").update(file).digest("hex"),
    };
  } finally {
    db.close();
    rmSync(scratch, { recursive: true, force: true });
  }
}
export function prune(directory, days = 7, now = Date.now()) {
  for (const file of readdirSync(directory)) {
    if (
      /^poker-.*\.enc$/.test(file) &&
      now - statSync(join(directory, file)).mtimeMs > days * 86400000
    )
      rmSync(join(directory, file));
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const target = join(
    process.env.BACKUP_DIRECTORY ?? "/backups",
    "poker-" + new Date().toISOString().replaceAll(":", "-") + ".enc",
  );
  const result = await backup(
    process.env.DB_PATH,
    target,
    process.env.BACKUP_KEY_FILE,
  );
  prune(dirname(target));
  console.log(JSON.stringify({ backup: "ok", ...result }));
}
