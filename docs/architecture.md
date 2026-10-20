# Architecture and module map

Implementation baseline selected for these plans: Vite + Preact + strict TypeScript; Node.js 24 LTS family; Colyseus; SQLite via better-sqlite3; npm workspaces. Patch versions and actual SDK exports/compatibility are verified and pinned in P01, not guessed here. Deployment is a single Node process on the existing OVH host behind its inspected HTTPS/WSS proxy. Static Vite assets are served by the same app origin. No SSR, Redis, ORM, canvas engine or multi-process room routing initially.

## Modules and dependency direction

| Module (NEW in plan) | Owns | Must not own |
|---|---|---|
| `packages/contracts` (P01/P02) | Validation schemas, public/private DTOs, command types, shared constants | Database drivers, cookies, UI state |
| `packages/domain` (P02) | Pure round transitions, modes, completion, projections | Network sockets or SQL |
| `apps/server/src/storage` (P03) | Migrations, identities, table snapshots, atomic commands | Publishing uncommitted room state |
| `apps/server/src/identity` (P03) | Anonymous cookie session and short-lived join ticket | Trusting user-supplied participant IDs |
| `apps/server/src/rooms` (P04) | Table directory, per-table queue, room lifecycle, public projection | Keeping empty rooms as permanent storage |
| `apps/server/src/http` (P04) | Session/create/join/read endpoints, origin/rate checks, health, static files | Returning other people's private votes |
| `apps/web/src/connection` (P05) | SDK lifecycle, retry/backoff, private own-vote channel, activity | Deriving authoritative outcome from local votes |
| `apps/web/src/ui` (P05) | Table, cards, roster, observing, settings, feedback | Implicit network writes from render |
| `apps/web/src/preferences` (P05) | locale, sound, motion, browser storage | Modifying room-wide suit locally only |
| `ops` (P06) | container, host integration, backup/restore, resource budget | Hosting other projects' configuration or credentials |

## Authoritative mutation pipeline

Validate payload and session → resolve persistent table → serialize command for that table → load/check current round and idempotency → pure transition → SQLite transaction → update in-memory state → broadcast sanitized delta and acknowledge.

If storage fails, do not mutate published state or acknowledge success. If the process dies after commit but before broadcast, reconnect loads the committed version. Retried command ID returns its prior outcome without applying again. If a client misses a delta, reconnect gets a full authoritative snapshot.

Colyseus supplies the transport/runtime, not durable table recovery. Durable `tableId` maps to one current runtime room ID. In-process promise coalescing plus a single writer prevents simultaneous wake-ups spawning duplicate rooms. The public link never depends on a disposed Colyseus room ID.

## Persistence and idle

The last connected person leaving releases timers and room memory after a short 30-second transport grace. Latest committed table stays in SQLite. On graceful stop stop admissions, drain queues (maximum 10 seconds), persist last accepted mutations, close connections, then database. On crash the same recovery path rehydrates state with all presence initially offline.

Activity is throttled genuine keyboard/pointer/touch interaction sent at most once per 30 seconds while connected. Transport ping/pong and incoming state do not count as interaction. Server schedules idle suspension against last accepted activity (15 minutes); frontend only resumes on new interaction, not merely focus/refocus or incoming events. Test browser background timer throttling explicitly.

## Performance target for team launch

Design for one team: prove one table of 20 people; run a modest headroom fixture of five tables × 20 SDK clients. Target local/network-excluded command-to-patch p95 ≤200 ms, zero lost acknowledged commands, and plateau after repeated table disposal. Initial app JS budget ≤200 KiB gzip including connection SDK; adjust only with measured package evidence in review, not silently. No endless animation loop; reduced motion zeroes transitions. All performance numbers are acceptance targets, not benchmark results.

SQLite uses WAL, foreign_keys=ON, synchronous=FULL and busy_timeout=5000 ms. One writer and short transactions; disk is local volume, never network-mounted SQLite. Backups use the SQLite online backup facility rather than copying a live main database file without its WAL. Load results decide whether further optimization is warranted.

## Diagram provenance

The local Archify diagram remains exploratory and is excluded from public Git because its receipts include machine paths. These project contracts supersede earlier diagram wording. The current stack/dependency boundaries are fully described here; no brain/vault content is embedded.

## Environment contract (example created by P01, verified on OVH in P06)

`NODE_ENV`, `PORT` (3000 default), `APP_ORIGIN` (exact origin), `DB_PATH` (local mounted file), `TRUST_PROXY_CIDRS` (explicit proxy networks, empty locally), `COOKIE_SECURE` (false only loopback dev), `MAX_ACTIVE_TABLES` (20), `LOG_LEVEL` (info), `BACKUP_DIRECTORY` (outside app volume). Max clients=20 and idle=900000 ms are product constants, not mutable unreviewed environment defaults. Backup encryption credentials and off-host target use the approved host's secret mechanism, never VITE_ variables or public-notice.ts. Production fails readiness on missing/invalid origin, insecure cookie or unwritable DB path. .env.example contains safe sample values only; .env is ignored.
