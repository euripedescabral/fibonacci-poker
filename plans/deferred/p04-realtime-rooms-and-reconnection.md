---
id: P04
name: Shared rooms, presence and recovery
status: deferred
dependencies: [P03]
activation: Predecessor P03 complete and archived; implementation authorized
priority: P1
effort: L
---
# P04 — Shared rooms, presence and recovery

## Layer 1 — Core Configuration

Current state: planning-only repository. All runtime files below are **NEW in their listed phase**, except explicit predecessor-owned files. No runtime gate has passed yet.

Objective: deliver shared rooms, presence and recovery according to the project contracts.

Requirements: R01 R02 R04 R05 R07–R11 R15 R16. Acceptance coverage: T01 T03 T04 T06 T07 T11 T12 T13 T14 T15 T16 T21 T23.

| Constraint | Rationale |
|---|---|
| Dependencies: P03 | No dispatch until prerequisites are verified and committed |
| One agent, one task worktree | Shared contracts/lockfile make serial implementation safer |
| Initial team/light use | No speculative scale architecture |
| No private workspace exports | Repository is public |

Success: all phase gates pass and the listed acceptance scenarios have actual evidence. Excluded: any new feature beyond the product contract, changes to other projects, and unapproved live deployment.

## Layer 1.5 — Security + Legal Posture

DESIGNED means specified but not implemented; release blockers require owner resolution, not invented risk acceptance.

| Boundary | Control | Status | Required evidence | Owner |
|---|---|---|---|---|
| Room capability | Origin and membership scoped per command; no listing/guessable IDs | DESIGNED / unverified | T01 T14 | Implementer; owner for release decisions |
| Hidden state | Inspect frames from separate users before reveal | DESIGNED / unverified | T03 | Implementer; owner for release decisions |
| Resource abuse | Limits, eviction and bounded queues | DESIGNED / unverified | T01 T15 T16 T21 | Implementer; owner for release decisions |
| Logging | No names/votes/cookies/URLs/tickets | DESIGNED / unverified | T21 | Implementer; owner for release decisions |

Privacy and legal lifecycle follows [security contract](../../docs/security.md); relevant controls must be verified in this plan and P06 before release. Payments, tracking, real gambling and emails: N/A, none in scope.

## Layer 1.6 — AI Safety Posture

N/A. No model calls, agents or user-executable tools in application runtime. Development assistants do not make this an AI feature.

## Layer 2 — Methodology Banks

- [docs/architecture.md](../../docs/architecture.md) — normative implementation contract.
- [docs/protocol.md](../../docs/protocol.md) — normative implementation contract.
- [docs/security.md](../../docs/security.md) — normative implementation contract.

Key pattern: At any async boundary, verify connection generation and serialize before the durable mutation. On replacement, revoke old generation before adding new connection. Empty runtime disposal never deletes durable table.


## Layer 3 — Command System

Phase 0: read AGENTS/workflow/contracts, reconcile Git history and plan status, create task worktree, run lifecycle begin, capture baseline. P01 establishes runtime commands; later plans use those scripts. Every file table is a closed implementation set; plan bookkeeping belongs to the coordinator.

### Phase P04-A — Room coordinator

Coalesce table wake-up, serialize mutation, commit then project, private own-vote response, exactly one runtime, enforce 20 seats atomically, queue and active-table bounds and authenticated message membership. Colyseus public patch state never holds hidden values.

| File | Change / ownership |
|---|---|
| `apps/server/src/rooms/directory.ts` | NEW — P04-A |
| `apps/server/src/rooms/table-room.ts` | NEW — P04-A |
| `apps/server/src/rooms/queue.ts` | NEW — P04-A |
| `apps/server/src/rooms/presence.ts` | NEW — P04-A |
| `tests/realtime/rooms.test.ts` | NEW — P04-A |
| `tests/realtime/visibility.test.ts` | NEW — P04-A |
| `tests/realtime/harness.ts` | NEW — P04-A |

**Gate:** `npm run test:realtime`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P04-B — HTTP and transport boundaries

Use the Node HTTP server shared with Colyseus (no second web framework); wire documented APIs, SDK transport, static SPA same origin, readiness, cookie/ticket verification, Origin/CSP/body limits, redacted logging and rate limits. Unknown table never silently creates. HTTP integration serves synthetic static fixtures until P05 provides the real Vite build; no dependency on nonexistent dist/. Reject membership forgery; enforce protocol version and trusted-proxy boundary. The harness must support real cookie/ticket handshakes, not bypass authentication.

| File | Change / ownership |
|---|---|
| `apps/server/src/http/routes.ts` | NEW — P04-B |
| `apps/server/src/http/security.ts` | NEW — P04-B |
| `apps/server/src/http/limits.ts` | NEW — P04-B |
| `apps/server/src/http/static.ts` | NEW — P04-B |
| `apps/server/src/main.ts` | NEW — P04-B |
| `tests/realtime/http.test.ts` | NEW — P04-B |
| `tests/realtime/security.test.ts` | NEW — P04-B |

**Gate:** `npm run test:realtime && npm run verify`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P04-C — Disposal and race proof

15-minute inactivity, 30-second disconnect grace, generation-safe tab replacement, graceful shutdown and persistent restoration with offline presence. Real SDK clients and isolated test process for commit-to-broadcast crash; not mocked-only transport.

| File | Change / ownership |
|---|---|
| `apps/server/src/rooms/lifecycle.ts` | NEW — P04-C |
| `tests/realtime/reconnect.test.ts` | NEW — P04-C |
| `tests/realtime/idle.test.ts` | NEW — P04-C |
| `tests/realtime/races.test.ts` | NEW — P04-C |
| `tests/realtime/crash.test.ts` | NEW — P04-C |

**Gate:** `npm run test:realtime && npm run verify`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Layer 3.1 — Dispatch Table

| Phase | Mode | Dependency | Owner | Files | Gate |
|---|---|---|---|---|---|
| P04-A | Serial | P03 | One executor in isolated worktree | Exact Phase P04-A table (7 files) | `npm run test:realtime` |
| P04-B | Serial | P04-A | One executor in isolated worktree | Exact Phase P04-B table (7 files) | `npm run test:realtime && npm run verify` |
| P04-C | Serial | P04-B | One executor in isolated worktree | Exact Phase P04-C table (5 files) | `npm run test:realtime && npm run verify` |

### Layer 3.2 — UI Flow Matrix

No UI files owned by this plan. Its backend transitions are consumed by the [UI flow matrix](../../docs/ui.md); contract changes must be reconciled there.

## Layer 4 — Patterns Reference

At any async boundary, verify connection generation and serialize before the durable mutation. On replacement, revoke old generation before adding new connection. Empty runtime disposal never deletes durable table.

Read [acceptance matrix](../../docs/acceptance.md) for negative cases. Test with synthetic names, isolated temporary database and process; do not run destructive fixtures against shared services. Amend the plan when evidence requires a contract change.

## Layer 5 — Meta

Resolved 2026-10-20: this is a planning package for the owner's team. Technology and behavior defaults live in project docs; live OVH facts are not assumed.

Blast radius: 19 implementation file paths, plus serial plan/index/changelog bookkeeping. No files created by this plan yet.

Learnings log (append-only): 2026-10-20 — greenfield gates are future outputs; no runtime verification can be claimed during authoring.

Cold-start continuity:
1. Read this plan and its banks; inspect index and actual Git history.
2. Verify dependency P03 and current contract versions; get a clean task worktree.
3. Run phase gates in order, stop on failure, record evidence without sensitive data.
4. Audit requirements and diff; finish lifecycle, archive only completed scope and activate successor.
