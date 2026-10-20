---
id: P03
name: Durable tables, identity and atomic mutations
status: complete
dependencies: [P02]
activation: Predecessor P02 complete and archived; implementation authorized
priority: P1
effort: L
---
# P03 — Durable tables, identity and atomic mutations

## Layer 1 — Core Configuration

Current state: planning-only repository. All runtime files below are **NEW in their listed phase**, except explicit predecessor-owned files. No runtime gate has passed yet.

Objective: deliver durable tables, identity and atomic mutations according to the project contracts.

Requirements: R01 R04 R07 R15. Acceptance coverage: T11 T12 T13 T14 T23.

| Constraint | Rationale |
|---|---|
| Dependencies: P02 | No dispatch until prerequisites are verified and committed |
| One agent, one task worktree | Shared contracts/lockfile make serial implementation safer |
| Initial team/light use | No speculative scale architecture |
| No private workspace exports | Repository is public |

Success: all phase gates pass and the listed acceptance scenarios have actual evidence. Excluded: any new feature beyond the product contract, changes to other projects, and unapproved live deployment.

## Layer 1.5 — Security + Legal Posture

DESIGNED means specified but not implemented; release blockers require owner resolution, not invented risk acceptance.

| Boundary | Control | Status | Required evidence | Owner |
|---|---|---|---|---|
| Identity | Public participant IDs cannot authenticate; raw cookie not stored | DESIGNED / unverified | T14 | Implementer; owner for release decisions |
| Durability | Atomic writes before publication; no swallowed DB failure | DESIGNED / unverified | T12 T13 | Implementer; owner for release decisions |
| Retention | Only current round; bounded receipts; expiry/deletion hooks exposed to P06 | DESIGNED / unverified | docs/security.md; operations proof T22 deferred to P06 | Implementer; owner for release decisions |

Privacy and legal lifecycle follows [security contract](../../docs/security.md); relevant controls must be verified in this plan and P06 before release. Payments, tracking, real gambling and emails: N/A, none in scope.

## Layer 1.6 — AI Safety Posture

N/A. No model calls, agents or user-executable tools in application runtime. Development assistants do not make this an AI feature.

## Layer 2 — Methodology Banks

- [docs/protocol.md](../../docs/protocol.md) — normative implementation contract.
- [docs/security.md](../../docs/security.md) — normative implementation contract.

Key pattern: BEGIN IMMEDIATE → existing receipt/high-water check → round check → write transition + receipt + revision → COMMIT. Only the returned committed snapshot can be published; rollback returns STORAGE_UNAVAILABLE.


## Layer 3 — Command System

Phase 0: read AGENTS/workflow/contracts, reconcile Git history and plan status, create task worktree, run lifecycle begin, capture baseline. P01 establishes runtime commands; later plans use those scripts. Every file table is a closed implementation set; plan bookkeeping belongs to the coordinator.

### Phase P03-A — Schema and migrations

Implement schema and PRAGMAs, version/checksum migration guard, temporary-disk tests, foreign keys and explicit transaction failures. Numeric ? representation is nullable/integer + discriminated flag, never numeric zero.

| File | Change / ownership |
|---|---|
| `apps/server/src/storage/database.ts` | NEW — P03-A |
| `apps/server/src/storage/migrations/001-initial.sql` | NEW — P03-A |
| `apps/server/src/storage/migrate.ts` | NEW — P03-A |
| `tests/storage/migrations.test.ts` | NEW — P03-A |

**Gate:** `npm run test:storage`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P03-B — Repository and replay

Atomic snapshot/vote/receipt/revision/sequence commit. Bound receipts without replay holes. Save clear receipt across successor round. Fault-inject before/after commit and busy/write failures; confirm recovered rows exactly.

| File | Change / ownership |
|---|---|
| `apps/server/src/storage/tables.ts` | NEW — P03-B |
| `apps/server/src/storage/commands.ts` | NEW — P03-B |
| `apps/server/src/storage/memberships.ts` | NEW — P03-B |
| `tests/storage/transactions.test.ts` | NEW — P03-B |
| `tests/storage/replay.test.ts` | NEW — P03-B |
| `tests/storage/recovery.test.ts` | NEW — P03-B |

**Gate:** `npm run test:storage && npm run verify`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P03-C — Anonymous identity

Hash durable cookie secrets, sliding lifetime, expiring one-use join tickets bound to identity/table and replacement generation. Session API is wired in P04; here test pure/service boundaries with real storage.

| File | Change / ownership |
|---|---|
| `apps/server/src/identity/session.ts` | NEW — P03-C |
| `apps/server/src/identity/tickets.ts` | NEW — P03-C |
| `tests/storage/identity.test.ts` | NEW — P03-C |

**Gate:** `npm run test:storage && npm run verify`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Layer 3.1 — Dispatch Table

| Phase | Mode | Dependency | Owner | Files | Gate |
|---|---|---|---|---|---|
| P03-A | Serial | P02 | One executor in isolated worktree | Exact Phase P03-A table (4 files) | `npm run test:storage` |
| P03-B | Serial | P03-A | One executor in isolated worktree | Exact Phase P03-B table (6 files) | `npm run test:storage && npm run verify` |
| P03-C | Serial | P03-B | One executor in isolated worktree | Exact Phase P03-C table (3 files) | `npm run test:storage && npm run verify` |

### Layer 3.2 — UI Flow Matrix

No UI files owned by this plan. Its backend transitions are consumed by the [UI flow matrix](../../docs/ui.md); contract changes must be reconciled there.

## Layer 4 — Patterns Reference

BEGIN IMMEDIATE → existing receipt/high-water check → round check → write transition + receipt + revision → COMMIT. Only the returned committed snapshot can be published; rollback returns STORAGE_UNAVAILABLE.

Read [acceptance matrix](../../docs/acceptance.md) for negative cases. Test with synthetic names, isolated temporary database and process; do not run destructive fixtures against shared services. Amend the plan when evidence requires a contract change.

## Layer 5 — Meta

Resolved 2026-10-20: this is a planning package for the owner's team. Technology and behavior defaults live in project docs; live OVH facts are not assumed.

Blast radius: 13 implementation file paths, plus serial plan/index/changelog bookkeeping. Implementation completed; see execution evidence below.

Learnings log (append-only): 2026-10-20 — greenfield gates are future outputs; no runtime verification can be claimed during authoring.

Cold-start continuity:
1. Read this plan and its banks; inspect index and actual Git history.
2. Verify dependency P02 and current contract versions; get a clean task worktree.
3. Run phase gates in order, stop on failure, record evidence without sensitive data.
4. Audit requirements and diff; finish lifecycle, archive only completed scope and activate successor.

### Execution evidence

33 tests passed; transactional rollback, SQLite write failure and lock contention, cookie identity, receipt replay and disk recovery verified.
