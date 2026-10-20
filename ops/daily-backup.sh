#!/usr/bin/env bash
set -euo pipefail
umask 077
cd "${POKER_DEPLOY_DIR:?Set the deployment directory}"
exec 9>maintenance.lock
flock -n 9 || exit 0
# Secrets are files mounted only into the short-lived operator container.
test -s private/backup.key
test -s private/offhost.json
test -f ledger/deletions.jsonl
image=$(docker inspect fibonacci-poker --format '{{.Image}}')
run_ops() {
  docker run --rm --network dokploy-network --user 1000:1000 --read-only \
    --cap-drop ALL --security-opt no-new-privileges:true --memory 256m --cpus 0.5 \
    -v fibonacci-poker-data:/data -v "$PWD/backups:/backups" \
    -v "$PWD/private:/private:ro" -v "$PWD/ledger:/ledger" \
    -e APP_STOPPED=true -e DB_PATH=/data/poker.sqlite \
    -e BACKUP_KEY_FILE=/private/backup.key -e DELETION_LEDGER=/ledger/deletions.jsonl \
    -e OFFHOST_CONFIG=/private/offhost.json "$image" node "$@"
}
# Brief daily maintenance ensures in-memory rooms cannot reintroduce expired rows.
docker compose stop poker >/dev/null
trap 'docker compose start poker >/dev/null' EXIT
run_ops ops/privacy.mjs expire
run_ops ops/backup.mjs
latest=$(find backups -maxdepth 1 -name 'poker-*.enc' -printf '%f\n' | sort | tail -1)
test -n "$latest"
run_ops ops/offhost.mjs upload "/backups/$latest"
date -u +%FT%TZ > backups/last-success
