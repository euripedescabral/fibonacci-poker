# Fibotable launch evidence — 2026-10-21

Live origin: https://fibotable.com. Application source: `cfe300b`. CI: [39606538018](https://github.com/euripedescabral/fibonacci-poker/actions/runs/39606538018), successful.

Release image: `sha256:506c3ae520295324aa205c4477fe43acd73428e70c9eed7c92121426a78dea43`. Single nonroot Docker container, dedicated SQLite volume, 1 CPU / 512 MiB, read-only root, existing external proxy network, no published application port. OVH account confirms Beauharnois (BHS), Canada, os-bhs6. No sibling service or proxy restart occurred.

## Public checks

- HTTPS GET homepage, privacy and readiness work; HTTP redirects to HTTPS. Use GET for monitoring: the static handler currently returns 404 for HEAD.
- Browser session cookie is Secure, HttpOnly, SameSite=Strict; strict CSP remains enabled.
- Independent desktop English and 390-pixel Portuguese browser sessions join the same table, privately choose cards and see shared reveal/mode. A watching participant is listed separately and can reveal. New round clears votes; reload recovers role/state. The same table/result recovered after production maintenance stopped/restarted the app. No horizontal overflow on the mobile table/privacy page.
- Cloudflare RUM was disabled; fresh browser navigation confirms no external script injection after propagation. An initial blocked beacon was a provider default, not application analytics.
- Runtime baseline remains 72 passing tests, typecheck/lint, 102 locale keys and bundle-budget pass. Previous 100-client / 30-minute load and restart/compatible-image rollback evidence remains in the release evidence document.

## Backup and operations

Dedicated private R2 bucket `fibotable-backups`, region Eastern North America. Public development URL and custom domains are disabled. Object credentials are restricted to this bucket. Credentials and AES key are mode 0600, outside the repository; recovery key is also escrowed outside OVH.

Real production backup upload, download, integrity verification and deletion-ledger-aware restore to a fresh isolated destination passed: 57,376 ciphertext bytes, SHA-256 `7eb38651d985dd5f0f4b625d4adf17f359b02f5cfaf1906fe5e0e41982cccf09`. The live database was not overwritten. The daily maintenance command ran successfully twice; cron is installed at 04:15 UTC. Retention is seven days for database backups; the latest deletion ledger is preserved. Maintenance logs rotate daily for seven days. Health was healthy with zero unexpected restarts and 77 GiB disk free. The documented owner-operated monitoring model checks health, disk and backup age; automatic paging is not configured.

## Limits and follow-up

The existing OVH host runs Ubuntu 25.04, shown as end-of-life by the provider. Schedule a separate shared-host OS upgrade; this release did not modify the shared OS. Physical-device, screen-reader and native 200% browser zoom certification remain outside recorded evidence. The MCP connection closed during a final optional observer-clear/socket-event repetition; earlier successful public browser flows and automated baseline coverage are retained, without claiming that repetition passed.
