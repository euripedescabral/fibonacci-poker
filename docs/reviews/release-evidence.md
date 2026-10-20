# P06 verification evidence — 2026-10-20

Scope: implementation and isolated OVH preflight. Public deployment is not complete; see [launch evidence](launch-evidence.md) and [release checklist](../release-checklist.md). Baseline P01–P05 commit: `503f2dd`.

## Local gates

Node 24.18.0. Unit/integration suites exercise actual SQLite and real Colyseus SDK sockets. The current verify run passes 72 tests across 25 files, plus source-boundary checks, TypeScript, ESLint and the KERNEL structural checker. GitHub CI also passes for implementation commits b843ff7 and 1ab3ade, including the Linux Docker build. Locale parity: 104 keys. Browser JS gzip: 92,802 bytes, below the 204,800-byte cap. Docker Compose configuration and shell syntax validate.

Operational assertions include live-WAL backup, AES-GCM tamper rejection, 0600 ciphertext permissions, refusing overwrite/missing ledger, deletion replay, frozen-card redaction and recomputed mode, export isolation, expiry and a corrupted off-host readback rejection. Remote retention tests preserve the current deletion ledger and prune only old database objects. The S3 mock test does not substitute for real provider access.

Crash fixture kills a separate Node process during an uncommitted SQLite transaction and verifies unchanged durable state and integrity. A real SQLITE_FULL induced with page capacity rejects a command, rolls back its receipt/vote, and succeeds after capacity restoration. Existing storage tests cover busy/read-only and migration-checksum failures.

Real SDK scenarios now include twenty active clients, replacement at capacity, a refused 21st identity, retry after a vacated slot is occupied, explicit rejection of a replaced socket held open by a transport fault fixture, and simultaneous vote/reveal with an immutable result. The client transport/DOM regressions confirm a rejected storage ACK preserves the selected card through pending/error states and an unacknowledged vote is not resent into a new round after reconnect.

## Actual OVH recovery

Docker 29.2.1, Linux amd64, Node 24.18.0. Dedicated synthetic fixture containers and volumes; no production traffic or shared proxy changes.

| Check | Observed result |
|---|---|
| Initial immutable image | `sha256:a9ea7f915740568b9caa7d295bc7cc5305b16282d042d7398740aedf1d98f9fa` |
| Operational candidate | `sha256:ad66879648f350d6e6444d36ec5394abf34895ed94246d7decee74c09438b92e` |
| Optimized candidate | `sha256:5f23465201edd005977df8dac43245eac78363b7fb87b5f0646839b4531d2a4c` |
| SIGTERM stop/start | Same table, round, private vote 8 and revealed mode; 1 second |
| SIGKILL/start | Same acknowledged state; 1 second |
| Previous-image rollback | Candidate → initial image on the same volume; fixture passes |
| Online backup → new volume | Authenticated restore, same table/round/vote/result; fixture passes |
| Optimized image on restored volume | Same recovery fixture passes |

Backup fixture: 57,376 encrypted bytes; SHA-256 `fe033cf667a4d7c2cc7294c9f3c0e59e5c6fb1ea45deafe910c0f865e6c9eb87`. This is a synthetic test artifact, not a production recovery point.

## Load and memory

The runner creates five distinct tables and one hundred real SDK clients, with twenty clients per table. Every round concurrently submits one hundred votes, reveals all five tables, verifies twenty cards plus room-specific modes, then clears all five. It checks every ACK with a timeout and measures command-to-ACK latency on the local Docker network; there is no external Internet latency in that measurement. Session/join setup respects the production rate limits. The measured soak starts after all clients connect.

The original 0.5-CPU/512-MiB soak completed 1800.009 seconds, 167 rounds and 18,370 acknowledged commands with **508.9 ms p95** (maximum 890.4 ms), failing the 200 ms gate. A separate 1-CPU calibration measured **362.9 ms p95**, also failing the gate. Investigation identified redundant full snapshots sent to every member for every vote, in addition to the normal public-state patch stream.

The optimized runtime sends private confirmation to the actor for individual actions and keeps immediate full synchronization for reveal/clear. Peers still receive the public patch stream; private-vote tests remain green. Compose proposes 1 CPU / 512 MiB following calibration. The optimized soak completed **1800.015 seconds, 173 rounds and 19,030 successful acknowledgments** with **172.54 ms p95** and 326.89 ms maximum. Exit status was zero; no lost ACKs or cross-room assertion failures. This passes the ≤200 ms p95 target. Observed working set was approximately 53.5 MiB with zero application restarts.

A separate disposal fixture completed twenty wake/join/leave/dispose cycles using real SDK clients and a controlled clock. Runtime room count returned to zero after every cycle. Heap grew from 21,043,448 to 21,325,576 bytes after warmup (282,128 bytes); final RSS was 136,773,632 bytes on the development host. This is a bounded-repeat regression, not proof that all future workloads are leak-free.

## Browser evidence

Playwright MCP, separate browser context for Portuguese mobile privacy at 360×800. The page selects Portuguese from locale, displays operator/private contact/retention/notices, and document width equals viewport width (360 px). English privacy also renders correctly. No provider login or authentication state is exported.

The isolated idle fixture advances the server clock fifteen minutes while a real browser holds a confirmed vote. The hand becomes disabled and Resume appears. Bringing the tab forward does not resume it; ArrowRight via real browser input reconnects and restores the selected, enabled card 5. The in-memory fixture has no public administration endpoint.

Limitations retained: public HTTPS/WSS smoke and real provider backup are blocked on provider configuration. Physical mobile hardware, screen-reader certification and actual browser 200% zoom are not claimed; prior viewport/touch and equivalent reflow evidence remains in the P05 acceptance report.

## Acceptance reconciliation

| IDs | Evidence / remaining limit |
|---|---|
| T01–T04 | Domain/storage suites plus real SDK visibility, admission, cross-room rejection and concurrent-clear tests; P05 browser flow |
| T05–T06 | Domain mode/ties/question-card/zero rules, late-join projection and immutable revealed snapshot tests |
| T07–T08 | Domain presence/completion rules, idle SDK fixture, audio gesture/dedup/refusal unit tests and browser controls |
| T09–T10 | Original SVG suit source, shared setting/browser checks, 104-key locale parity, locale/preferences and reduced-motion tests |
| T11 | Real runtime-disposal fixture, persistent storage tests and actual OVH process restart with same table/round/private vote |
| T12 | Separate process killed before COMMIT; existing commit-before-broadcast crash/reconnect fixture |
| T13 | Busy/read-only storage tests, real SQLITE_FULL transaction rollback and real WebSocket rejection/recovery with unchanged published state |
| T14 | Forged/expired/reused ticket, origin/header/session, schema and cross-room security tests |
| T15 | SDK fake-clock idle tests plus real-browser focus-versus-trusted-keyboard resumption with selected card restored |
| T16 | Twenty real SDK clients, replacement/retry at capacity, and explicit rejection of messages from a replaced socket held open by a fault fixture |
| T17 | Recorded P05 keyboard, mobile/touch emulation and viewport/equivalent-reflow checks; physical-device and screen-reader certification not claimed |
| T18 | Full baseline failed latency; optimized 30-minute soak passed at 172.54 ms p95 with 19,030 successful ACKs; twenty-cycle disposal memory regression passed |
| T19 | Live WAL backup restored into a separate OVH volume; integrity checks and failed-migration startup tests; real off-host provider restore remains blocked |
| T20 | Container isolation, SIGTERM/SIGKILL recovery and compatible-image rollback passed; public HTTPS/WSS remains blocked |
| T21 | Injection/size/protocol/queue/rate-limit tests and restrictive untrusted proxy-header behavior; no claim of a high-traffic security audit |
| T22 | Export isolation, deletion cascades, frozen-result redaction/mode recalculation, expiry and restore ledger tests; provider ledger escrow not yet configured |
| T23 | Concurrent vote/reveal, conflicting command reuse, stale-round and sequence/receipt rules tested |
| T24 | Pending/error DOM and transport tests preserve confirmed values; disconnect/new-round never replays the vote; protocol mismatch/static recovery evidence in P05 |

A passing test count is not a substitute for the remaining deployment checks. Rows with provider/public-origin limits remain open until real release evidence exists.

Final isolation observation: existing application containers report healthy status and zero restarts, with start times predating this task. Their routes/configurations were not modified. This is not a claim of continuous external uptime monitoring. Temporary poker test servers were stopped after validation; no production poker service was published.
