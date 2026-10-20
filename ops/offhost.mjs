import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { encrypt } from "./backup.mjs";
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
export async function uploadVerified(client, bucket, key, bytes) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: "application/octet-stream",
    }),
  );
  const remote = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  if (
    !remote.Body ||
    digest(await remote.Body.transformToByteArray()) !== digest(bytes)
  )
    throw Error("Off-host round-trip verification failed");
}
export async function pruneRemote(client, bucket, now = Date.now()) {
  let token;
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: "backups/poker-",
        ContinuationToken: token,
      }),
    );
    for (const object of page.Contents ?? []) {
      if (
        /^backups\/poker-.*\.enc$/.test(object.Key ?? "") &&
        object.LastModified &&
        now - object.LastModified.getTime() > 7 * 86400000
      ) {
        await client.send(
          new DeleteObjectCommand({ Bucket: bucket, Key: object.Key }),
        );
      }
    }
    token = page.NextContinuationToken;
  } while (token);
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const config = JSON.parse(readFileSync(process.env.OFFHOST_CONFIG, "utf8"));
  if (!config.bucket || new URL(config.endpoint).protocol !== "https:")
    throw Error("Dedicated private bucket and HTTPS endpoint required");
  const client = new S3Client({
    region: config.region ?? "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    maxAttempts: 3,
  });
  try {
    const [action, file] = process.argv.slice(2);
    if (action === "upload") {
      const ledger = encrypt(
        readFileSync(process.env.DELETION_LEDGER),
        process.env.BACKUP_KEY_FILE,
      );
      await uploadVerified(client, config.bucket, "deletions.enc", ledger);
      const name = file.split("/").at(-1);
      if (!/^poker-.*\.enc$/.test(name)) throw Error("Unexpected backup name");
      await uploadVerified(
        client,
        config.bucket,
        "backups/" + name,
        readFileSync(file),
      );
      await pruneRemote(client, config.bucket);
      console.log("offhost_verified");
    } else if (action === "download") {
      if (!/^poker-[\w.:-]+\.enc$/.test(file))
        throw Error("Unexpected backup name");
      for (const [key, target] of [
        ["backups/" + file, file],
        ["deletions.enc", "deletions.enc"],
      ]) {
        const object = await client.send(
          new GetObjectCommand({ Bucket: config.bucket, Key: key }),
        );
        writeFileSync(target, await object.Body.transformToByteArray(), {
          mode: 0o600,
          flag: "wx",
        });
      }
      console.log("offhost_downloaded");
    } else throw Error("Use upload or download");
  } finally {
    client.destroy();
  }
}
