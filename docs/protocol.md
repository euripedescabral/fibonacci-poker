# Protocol and persistence contract

P01–P04 implement the routes and persistence below. P05 consumes them in the browser. Production HTTPS/proxy and operational release verification belong to P06.

## Routes and identity

Same-origin HTTPS in production; Vite dev proxy keeps the browser origin consistent locally.

| Route | Semantics |
|---|---|
| `POST /api/session` | Create/refresh anonymous identity; set host-only HttpOnly Secure SameSite=Strict cookie; no token in body/localStorage. |
| `POST /api/tables` | Valid session + Origin + JSON; create persistent random table ID and default open round; return share path. |
| `POST /api/tables/:tableId/join` | Validate table capability/name (name optional for an existing membership; required for a new member); return short-lived single-use SDK join ticket, runtime room ID, last accepted sequence and schemaVersion. Wake room once, reserve capacity atomically. |
| `GET /api/tables/:tableId` | Authenticated capability read of sanitized table metadata/current phase; no private votes or member identity secret. Unknown table → 404, never auto-create. |
| `GET /health/live` | Process liveness without sensitive metadata. |
| `GET /health/ready` | Readiness only after migrations, storage availability and admission enabled. |
| `/privacy` | Bilingual privacy/use notice, verified operator data supplied before launch. |
| `/t/:tableId` | SPA route; display enter-name screen or reconnect existing member. |
| Colyseus transport endpoint | SDK handshake consumes ticket; no caller-supplied identity; authenticated membership on every command. |

Cookie opaque 32 random bytes; database holds only SHA-256 hash. Rolling 365-day lifetime; separate participant ID is public but cannot authenticate. No credentials in URL. Join ticket lifetime 60 seconds, one-use; keep ticket in memory, exclude handshake payloads/query strings from logs. Reconnect tokens are temporary SDK transport credentials; after expiry or restart, rejoin via durable cookie and table ID. Secure cookie disabled only for explicit loopback development.

## Commands

Envelope `{commandId, sequence, roundId, type, payload}` validated by strict discriminated schema (reject unknown fields). IDs opaque; commandId a UUID. Server derives identity, table and connection from membership. `roundId` mandatory for every mutation including modes/settings. Maximum frame 4 KiB. Public state carries monotonic `revision` and `roundId`.

| type | Payload | Permission / behavior |
|---|---|---|
| `vote` | `{value: 0|1|2|3|5|8|13|21|34|'?'}` | Connected active voter, either phase. Replaces own vote. |
| `withdraw` | `{}` | Connected active voter, either phase. No vote is a successful no-op. |
| `setMode` | `{mode:'voter'|'observer'}` | Connected member; open observer transition removes own vote; revealed cards unchanged by mode switches. |
| `reveal` | `{}` | Any connected member; requires ≥1 submitted card; publish result and values. Already revealed same round returns current result. |
| `hide` | `{}` | Any connected member; return to open, clear public result, retain round ID, votes and completion marker. Already open is a successful no-op. |
| `clear` | `{}` | Any connected member; create new round, retain members/settings, remove old-round votes/results. Old roundId rejects delayed duplicate with new commandId. |
| `setSuit` | `{suit:'ember'|'claw'|'orbit'|'split-crown'}` | Any connected member; room-wide cosmetic change. |
| `activity` | no durable command envelope; monotonic transport ping | Member activity only; rate-limited, updates idle timer; no database write for every movement. |

Same commandId + same identity/table/type/payload hash returns prior result; same ID with changed payload → `COMMAND_CONFLICT`. Lookup dedup before round check for recent clear acknowledgements; persist clear receipt through one successor round, then stale roundId suffices to reject it. Bound receipts to current and immediate predecessor round and last 100 commands/member/round. A retried pruned command is rejected when stale; a current pruned command must not apply again: use monotonic per-member command sequence and high-water mark as well as IDs (see P02/P03). Envelope also carries `sequence` positive integer; client persists its next sequence per table, server communicates last accepted sequence on rejoin. Queue one outstanding mutation/client; if browser loses sequence, rejoin establishes the next value. Exact duplicate kept receipt replays; sequence ≤ high-water with no receipt → `ALREADY_PROCESSED` and authoritative resync, never execute.

Concurrent distinct users' votes both succeed; don't demand a global revision for unrelated votes. Reveal racing a vote resolves by queue order. Votes after reveal update the author’s card and recalculate mode. Hide racing a vote resolves by queue order; final open projections never include values. Two clears with the same old roundId create exactly one new round. Two cold joins instantiate one runtime, and max-client reservation cannot overshoot 20. A later replacement connection invalidates the older connection generation before accepting its commands.

## State visibility

Public open projection: table/round/revision, suit, connected roster names/IDs/modes/status, hasVoted flags and completion counts. **No hidden value in public Schema, metadata, logs, error payloads or hidden DOM.** Own selected value sent via authenticated private response/channel only. Public revealed projection contains editable cards with author snapshots and current numerical mode. Values for disconnected voters stay in the reveal result; completion denominator only uses active connected voters.

Result is `{kind:'mode', values:number[], count:number}` (ascending ties) or `{kind:'no-numeric-votes'}`; all submitted `?` is a valid revealed round without numeric result. Completion event `{roundId,eventId}` is persisted as emitted with the winning transition before publication. Client arms sound from a gesture, deduplicates by eventId and never synthesizes sound from a restored snapshot. Delivery is best-effort: a crash may suppress a sound, but cannot replay the round's event. There is no claim of exactly-once audible playback across devices/crashes.

## Database layout

| Table | Key fields and invariant |
|---|---|
| `identities` | id, token_hash UNIQUE, created_at, expires_at; opaque cookie never stored raw |
| `tables` | table_id PK, schema_version, revision, round_id, phase, suit, completion_emitted, revealed_snapshot_json nullable, updated_at |
| `memberships` | table_id + identity_id PK, display_name, mode, seat_index, last_seen_at, last_sequence; FK to table/identity |
| `votes` | table_id + round_id + identity_id PK, value (validated enum), updated_at; scoped to current round |
| `command_receipts` | table_id + identity_id + command_id PK, round_id, sequence, payload_hash, result_json; bounded replay window |
| `schema_migrations` | version PK, checksum, applied_at; fail on checksum drift |

Round transition, vote/result changes, completion marker, revision, high-water sequence and receipt are one transaction. Presence/transport connection IDs are memory-only; after recovery everyone is offline until authenticated join. Membership last_seen is persisted on connect/disconnect and periodically at most once per minute, not per heartbeat. A new entrant gets the lowest unused active seat; a returning member prefers its former seat if free. No permanent seat reservation.

## Error contract

Stable codes localized at UI: INVALID_INPUT, SESSION_EXPIRED, TABLE_NOT_FOUND, TABLE_FULL, OBSERVER_CANNOT_VOTE, ROUND_CLOSED, STALE_ROUND, NO_VOTES, COMMAND_CONFLICT, ALREADY_PROCESSED, CONNECTION_REPLACED, RATE_LIMITED, STORAGE_UNAVAILABLE, SERVER_RESTARTING, SERVER_BUSY, CLIENT_OUTDATED. Include commandId when available, retryable flag and safe message key, never stack/token/vote of another person. STORAGE_UNAVAILABLE doesn't masquerade as success. Clients resync on stale round or sequence, not blindly replay against a new round.

## Bounded work and compatibility

Queue at most 128 pending commands/table; overload returns retryable RATE_LIMITED before admission. Default MAX_ACTIVE_TABLES=20 (configurable), returning SERVER_BUSY on cold wake-up over capacity without deleting durable tables. Target team load is far below this bound. Trust forwarded IP/proto only from the exact inspected proxy network/hop; never accept arbitrary X-Forwarded-For from public clients.

Schema/protocol mismatch must return CLIENT_OUTDATED with a Reload action, not a reconnect loop. Deployment serves hashed static assets with immutable cache and HTML no-cache. Hold previous hashed assets across a deploy or show a reload recovery screen on chunk failure. After 6 failed reconnect attempts (1,2,4,8,16,30-second capped delays plus jitter), show explicit Retry; preserve confirmed state as read-only.
