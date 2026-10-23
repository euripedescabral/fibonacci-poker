---
id: P08
name: Editable revealed votes and hide cards
status: complete
dependencies: [P07]
activation: Owner requested local implementation; deployment excluded
priority: P1
effort: S
---
# P08 — Editable revealed votes

## Layer 1 — Core Configuration
Allow connected voters, including late joiners, to add, change and withdraw cards after reveal. Update mode immediately. Add hide without changing round ID, votes or completion marker. Clear alone starts a new round. No deployment or infrastructure changes.
## Layer 1.5 — Security + Legal Posture
Existing authenticated command queue and receipts remain authoritative. DESIGNED: hiding clears the public result, subsequent private edits stay private; previously seen cards cannot be made unknown. Gate: domain and real SDK visibility tests. Owner: coordinator.
## Layer 1.6 — AI Safety Posture
N/A; no AI runtime.
## Layer 2 — Methodology Banks
Use docs/product.md, docs/protocol.md and docs/ui.md. Preserve observer restrictions, stale-round rejection, transactional persistence and once-per-round sound. Mode changes alone retain the existing revealed card; explicit card edits update only that author's snapshot.
## Layer 3 — Command System
### Phase A
- `packages/contracts/src/commands.ts` — update behavior and regression coverage.
- `packages/domain/src/round.ts` — update behavior and regression coverage.
- `tests/domain/round.test.ts` — update behavior and regression coverage.
- `tests/realtime/races.test.ts` — update behavior and regression coverage.
- `tests/realtime/visibility.test.ts` — update behavior and regression coverage.
- `tests/storage/recovery.test.ts` — update behavior and regression coverage.
Gate: `npm run test:domain && npm run test:storage && npm run test:realtime`.
### Phase B
- `apps/web/src/ui/table.tsx` — update behavior and regression coverage.
- `apps/web/src/i18n/en.ts` — update behavior and regression coverage.
- `apps/web/src/i18n/pt.ts` — update behavior and regression coverage.
- `tests/web/table.test.tsx` — update behavior and regression coverage.
Gate: `npm run test:web && npm run check:i18n`.
### Phase C
- `docs/product.md` — update behavior and regression coverage.
- `docs/protocol.md` — update behavior and regression coverage.
- `docs/ui.md` — update behavior and regression coverage.
- `docs/acceptance.md` — update behavior and regression coverage.
- `tests/browser/scenarios.md` — update behavior and regression coverage.
Gate: `npm run verify && npm run check:i18n && npm run build && npm run check:bundle`.
### Layer 3.1 — Dispatch Table
Serial coordinator only: A → B → C; exact ownership and gates above. No worker dispatch.
### Layer 3.2 — UI Flow Matrix
Vote/change/withdraw: voters in either phase; existing Sending/Enviando pending state and rollback to confirmed state on error. Hide/Ocultar cartas: all connected members; same pending lock, authoritative open state on success, unchanged cards on failure. New round remains separate. Existing dark theme, keyboard buttons and reduced motion apply. Update docs/ui.md with complete transitions.
## Layer 4 — Patterns Reference
Explicit idempotent hide command, never a server-side toggle. Rebuild result from revealed cards after own-card edits; preserve other authors' snapshots. Clear public reveal on hide and rebuild from current votes on next reveal. Existing storage schema supports both states.
## Layer 5 — Meta
Local implementation authorized; deploy explicitly prohibited. Baseline main 0a387a8. Verify late votes, changed mode/ties, withdrawals to empty, repeated hide, stale commands, restored hidden votes and public privacy. Browser verification uses Playwright MCP only.


### Verification — 2026-10-22
- Node 24.18.0: `npm run verify` passed, 92 tests in 26 files; typecheck, lint, boundaries and plan structure passed.
- `npm run check:i18n`: 106 matching keys. `npm run build` passed; `npm run check:bundle`: 94,158 gzip bytes / 204,800 budget.
- Local production build on loopback port 4318, isolated temporary SQLite: Playwright MCP created table, voted 5, revealed, changed to 8 (result 8), hid (result absent, own selection retained), changed to 13, revealed (result 13), started new round (selection/result absent).
- Real SDK tests cover late join vote, observer hide, private edits after hide, and concurrent vote/reveal. Storage restart restores edited hidden vote, same round and completion marker.
- Physical-device and screen-reader checks not repeated. No push or deployment; production remains unchanged.

### Deployment authorization and evidence — 2026-10-23
Owner explicitly requested deployment, superseding the earlier local-only boundary. Release bookkeeping scope: this plan, plans/README.md and plans/CHANGELOG.md. Gate: plan checker, public readiness and production smoke; no runtime edits.

- Source `273e9c6`; [CI run 39945677828](https://github.com/euripedescabral/fibonacci-poker/actions/runs/39945677828) passed. Local Node 24.18.0 gates and pre-push hooks passed with 92 tests, 106 locale keys and 94,158-byte gzip bundle.
- Live image `fibotable:273e9c6-release`, immutable ID `sha256:d0940638aef1b3896ecf049010c6c6d1073d63c12689a7dd026e82a9b4508f02`. Rollback image retained: `fibotable:7363628-release`, ID `sha256:8af6fa3ea36065ea413e01fee2f2dce7dd759b5a304ba4d409fbf7f5726ec24c`.
- Pre-release encrypted backup and off-host upload/download verification passed at 11:24:03 UTC: 114,720 bytes; SHA-256 `821abc9ac650c1b11fd8f5583775b6a98fe286460434c5c80c3d03b484b3054d`.
- Updated only the application service under its maintenance lock with the existing persistent volume. Compose health wait passed, public HTTPS readiness returned `{ "ok": true }`, zero container restarts, and sibling container IDs/health were unchanged.
- Production Playwright MCP: a pre-deploy vote of 5 survived release and reload; reveal → change to 8 updated result; hide removed result and retained selection; re-reveal/new-round worked.
- Two independent real SDK identities over HTTPS/WSS: late revealed vote, shared tie/mode recalculation, hide retaining round and own vote, private edit, re-reveal, withdrawal and clear all passed. Synthetic rounds cleared after smoke.
- Operational command semantics checked against [Docker Compose up documentation](https://docs.docker.com/reference/cli/docker/compose/up/). No schema migration, shared proxy restart or sibling deployment.
