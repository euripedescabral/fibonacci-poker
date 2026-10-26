# Operations

One application process, one dedicated SQLite volume, one external Traefik network. Initial audience is the owner's team. Production is live at https://fibotable.com; see the launch evidence for the deployed artifact, backup rehearsal and remaining host maintenance.

## Container

Build with Node 24.22.1 on Linux amd64. The final image runs as UID/GID 1000, drops all capabilities, has no new privileges and a read-only root filesystem. Only `/data` and a 16 MiB temporary filesystem are writable. Compose exposes no host port and joins the existing external `dokploy-network`. Application origin must be the exact HTTPS URL; Secure cookies remain enabled. No proxy forwarding header is trusted: limits use the socket IP, shared behind the existing proxy. For this small team, 60 sessions/joins per minute is intentional; larger audiences require an explicit trusted-proxy design.

```sh
docker compose config --quiet
docker build --build-arg VITE_HOSTING_REGION="VERIFIED REGION" \
  --build-arg VITE_RELEASE_READY=true -t fibonacci-poker:RELEASE .
POKER_IMAGE=fibonacci-poker:RELEASE APP_ORIGIN=https://APPROVED_DOMAIN docker compose up -d
docker inspect fibonacci-poker --format '{{.State.Health.Status}}'
```

Do not use `latest` for release selection. Record the immutable image ID, source commit and prior tested image. Migrations run before the server listens; a checksum mismatch must prevent readiness. Docker health is an observation, not an automatic restart policy. An unhealthy running process requires operator investigation.

## Backup and keys

SQLite is in WAL mode with FULL synchronization. Copying the live `.sqlite` file alone is unsafe. `ops/backup.mjs` uses the [SQLite online backup API](https://www.sqlite.org/backup.html), verifies the resulting database, and encrypts it using AES-256-GCM with a random 96-bit nonce and an external 256-bit key. The format is `FPB1`, nonce, authentication tag, ciphertext. Files are mode 0600; scratch directories are 0700 and removed after each attempt. Entire snapshots are buffered in memory; this is appropriate for the measured small database, not an unbounded data service.

Create project directories `backups`, `ledger`, `private` with mode 0700 and owner 1000:1000. Generate `private/backup.key` as 32 cryptographically random bytes, mode 0600. Escrow that key privately **off the OVH server**, separately from the bucket credentials. Never print it, commit it or put it in documentation. Initialize an empty `ledger/deletions.jsonl`; absence is an error, not an empty ledger assumption.

`private/offhost.json` contains `endpoint`, `region`, `bucket`, `accessKeyId`, `secretAccessKey`. Use a dedicated private bucket and object-scoped credentials. No public bucket or public download URL. The S3 adapter follows the [provider's official SDK guidance](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/). It uploads encrypted database and ledger, downloads each again and compares SHA-256 before recording success. Database objects older than seven days are pruned; the current deletion ledger is separate and never pruned by that routine. Do not apply a bucket-wide seven-day lifecycle to the ledger.

Set `POKER_DEPLOY_DIR` to the actual isolated deployment directory, including in the operator crontab environment. Install the reviewed `ops/daily-backup.sh` under that directory. It uses a maintenance lock and stops only this application briefly for expiry cleanup, then restarts it even if backup fails. Schedule at 04:15 UTC daily with the deployment user's crontab; preserve other cron entries. Example entry after credentials and a real restore have been verified:

```cron
15 4 * * * POKER_DEPLOY_DIR=$POKER_DEPLOY_DIR /bin/bash $POKER_DEPLOY_DIR/ops/daily-backup.sh >> $POKER_DEPLOY_DIR/backup-status.log 2>&1
```

Local backup retention is seven days; off-host backups also expire after seven days. Alert/review if `backups/last-success` is older than 26 hours, free space is below 15%, the container is unhealthy, or restart count increases unexpectedly. Owner checks these daily during initial team use. Docker logs are bounded to three 5 MiB files and contain operational codes, not participant names/votes/cookies. There is no external alert recipient configured yet; do not claim automatic paging. Rotate the backup status log separately during deployment.

## Restore

Restore rehearsal must use a **new volume**, never overwrite the running database. Stop the app before any live restore or privacy maintenance. Preserve the old volume/image for investigation. Download the selected encrypted database plus **latest** `deletions.enc` from the approved bucket. Decrypt the ledger with `decrypt()` from `ops/backup.mjs` into a private 0600 file; never print its contents.

Run an operator container with the new target volume, external key and current ledger mounted:

```sh
APP_STOPPED=true DB_PATH=/data/poker.sqlite \
  BACKUP_KEY_FILE=/private/backup.key DELETION_LEDGER=/ledger/deletions.jsonl \
  RESTORE_PATH=/restore/poker.sqlite node ops/restore.mjs /backups/poker-TIMESTAMP.enc
```

The tool rejects existing target/WAL/SHM files, a wrong key, damaged ciphertext, missing/malformed ledger, integrity failures and foreign-key errors. It replays deletions before exposing the restored database. Start the candidate against the separate volume and verify readiness, the same synthetic link/round and private vote, then switch only this app's volume after operator verification. Production identities/cookies must never appear in public test evidence.

Targets: acknowledged writes survive process restart; restart recovery within 60 seconds. Host-loss recovery target is one business day with at most 24 hours of data loss, **conditional on a verified daily off-host job and key escrow**. These are operating targets, not a contractual availability guarantee.

## Export, deletion and expiry

Contact the operator privately. Never ask a requester to publish their cookie, token or table URL. Verify identity with a live authenticated session and an operator-observed challenge in the relevant table, or an owner-reviewed private verification procedure if the cookie is lost. A display name alone is not proof. The operator identifies the opaque member ID from the verified table session; do not add a public admin endpoint.

Acquire the maintenance lock used by daily backup, stop this app, and run `ops/privacy.mjs export ID` with `APP_STOPPED=true` and the database mounted. Redirect the JSON to a private mode-0600 file, deliver only through the agreed private route, then remove that temporary export. The output contains only that identity's memberships, votes and revealed cards, never its cookie hash or another member's data.

For deletion, run `ops/privacy.mjs delete ID` with `DELETION_LEDGER` outside the database volume. The ledger is durably appended before SQL deletion. Current votes, memberships and receipts cascade away; frozen snapshots lose the removed name/card and recompute the mode. Upload and verify the updated encrypted ledger off-host **before confirming completion**. Retry an interrupted deletion by replaying the ledger; it is idempotent. Restart the app after maintenance so stale in-memory snapshots cannot reintroduce data.

`ops/privacy.mjs expire` performs the same operation for expired identities (365 days without session renewal). Daily maintenance owns this cleanup. Table IDs/settings remain reusable. Existing encrypted backups age out within seven days; restoring them always replays the latest ledger first.

## Rollback and incident

For a code-only rollback with compatible schema, stop this app, select the prior tested immutable image and start it with the same volume. Do not run down-migrations or erase the volume. If migrations are incompatible, use the controlled new-volume restore procedure and communicate the recovery point. Verify health and the same synthetic table after either route.

For a suspected data incident, restrict this application's route, preserve relevant private evidence, investigate affected identities and backups, and have the operator assess notification obligations for the actual audience and jurisdiction. Do not copy votes/cookies into GitHub issues. The owner is the incident contact. Consult the current [ANPD incident procedure](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis) where applicable, and the relevant authority for any other jurisdiction. Current legal obligations require case-specific review; this runbook does not assert blanket compliance.
