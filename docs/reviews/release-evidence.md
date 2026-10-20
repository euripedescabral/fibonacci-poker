# P06 verification evidence — 2026-10-20

Scope: implementation and isolated OVH preflight. Public deployment is not complete; see [launch evidence](launch-evidence.md) and [release checklist](../release-checklist.md). Baseline P01–P05 commit: `503f2dd`.

## Local gates

Node 24.18.0. Unit/integration suites exercise actual SQLite and real Colyseus SDK sockets. The current verify run includes source-boundary checks, TypeScript, ESLint, tests and the KERNEL structural checker. Locale parity: 104 keys. Browser JS gzip: 92,802 bytes, below the 204,800-byte cap. Docker Compose configuration and shell syntax validate.

Operational assertions include live-WAL backup, AES-GCM tamper rejection, 0600 ciphertext permissions, refusing overwrite/missing ledger, deletion replay, frozen-card redaction and recomputed mode, export isolation, expiry and a corrupted off-host readback rejection. Remote retention tests preserve the current deletion ledger and prune only old database objects. The S3 mock test does not substitute for real provider access.

Crash fixture kills a separate Node process during an uncommitted SQLite transaction and verifies unchanged durable state and integrity. A real SQLITE_FULL induced with page capacity rejects a command, rolls back its receipt/vote, and succeeds after capacity restoration. Existing storage tests cover busy/read-only and migration-checksum failures.

Real SDK scenarios now include twenty active clients, replacement at capacity, a refused 21st identity, retry after a vacated slot is occupied, and simultaneous vote/reveal with an immutable result. The client transport regression confirms an unacknowledged vote is not resent into a new round after reconnect.

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

The original 0.5-CPU/512-MiB soak is still being collected. A separate 1-CPU calibration measured **362.9 ms p95**, failing the 200 ms gate. Investigation identified redundant full snapshots sent to every member for every vote, in addition to the normal public-state patch stream.

The optimized runtime sends private confirmation to the actor for individual actions and keeps immediate full synchronization for reveal/clear. Peers still receive the public patch stream; private-vote tests remain green. Compose proposes 1 CPU / 512 MiB following calibration. The optimized 30-minute soak is in progress; an early ten-round sample measured 182.9 ms p95. **This early sample is not a completed soak pass.**

A separate disposal fixture completed twenty wake/join/leave/dispose cycles using real SDK clients and a controlled clock. Runtime room count returned to zero after every cycle. Heap grew from 21,043,448 to 21,325,576 bytes after warmup (282,128 bytes); final RSS was 136,773,632 bytes on the development host. This is a bounded-repeat regression, not proof that all future workloads are leak-free.

## Browser evidence

Playwright MCP, separate browser context for Portuguese mobile privacy at 360×800. The page selects Portuguese from locale, displays operator/private contact/retention/notices, and document width equals viewport width (360 px). English privacy also renders correctly. No provider login or authentication state is exported.

The isolated idle fixture advances the server clock fifteen minutes while a real browser holds a confirmed vote. The hand becomes disabled and Resume appears. Bringing the tab forward does not resume it; ArrowRight via real browser input reconnects and restores the selected, enabled card 5. The in-memory fixture has no public administration endpoint.

Limitations retained: public HTTPS/WSS smoke and real provider backup are blocked on provider configuration. Physical mobile hardware, screen-reader certification and actual browser 200% zoom are not claimed; prior viewport/touch and equivalent reflow evidence remains in the P05 acceptance report.
