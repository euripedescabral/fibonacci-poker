---
id: P02
name: Round rules and private/public protocol
status: complete
dependencies: [P01]
activation: Predecessor P01 complete and archived; implementation authorized
priority: P1
effort: M
---
# P02 — Round rules and private/public protocol

## Layer 1 — Core Configuration

Current state: planning-only repository. All runtime files below are **NEW in their listed phase**, except explicit predecessor-owned files. No runtime gate has passed yet.

Objective: deliver round rules and private/public protocol according to the project contracts.

Requirements: R03–R11. Acceptance coverage: T02 T05 T06 T07 T23.

| Constraint | Rationale |
|---|---|
| Dependencies: P01 | No dispatch until prerequisites are verified and committed |
| One agent, one task worktree | Shared contracts/lockfile make serial implementation safer |
| Initial team/light use | No speculative scale architecture |
| No private workspace exports | Repository is public |

Success: all phase gates pass and the listed acceptance scenarios have actual evidence. Excluded: any new feature beyond the product contract, changes to other projects, and unapproved live deployment.

## Layer 1.5 — Security + Legal Posture

DESIGNED means specified but not implemented; release blockers require owner resolution, not invented risk acceptance.

| Boundary | Control | Status | Required evidence | Owner |
|---|---|---|---|---|
| Private votes | Never place hidden values in shared state or error payload | DESIGNED / unverified | T03 projection precursors; P02-B negative projection tests | Implementer; owner for release decisions |
| Replay | Round boundaries + sequence contract immutable | DESIGNED / unverified | T23 | Implementer; owner for release decisions |
| Product fairness | No privileged host; all connected members reveal/clear | DESIGNED / unverified | T04 contract; transport enforcement P04 | Implementer; owner for release decisions |

Privacy and legal lifecycle follows [security contract](../../docs/security.md); relevant controls must be verified in this plan and P06 before release. Payments, tracking, real gambling and emails: N/A, none in scope.

## Layer 1.6 — AI Safety Posture

N/A. No model calls, agents or user-executable tools in application runtime. Development assistants do not make this an AI feature.

## Layer 2 — Methodology Banks

- [docs/product.md](../../docs/product.md) — normative implementation contract.
- [docs/protocol.md](../../docs/protocol.md) — normative implementation contract.

Key pattern: Transition(state, authenticatedMember, command, now) returns either a proposed next snapshot plus effects or a stable error. It performs no IO; server persists before publishing.


## Layer 3 — Command System

Phase 0: read AGENTS/workflow/contracts, reconcile Git history and plan status, create task worktree, run lifecycle begin, capture baseline. P01 establishes runtime commands; later plans use those scripts. Every file table is a closed implementation set; plan bookkeeping belongs to the coordinator.

### Phase P02-A — Runtime contracts

Define strict command schemas including IDs/sequence, result union, own-vote payload and allowlisted public projection; enforce deck/name/size contracts. Index is EXISTING from P01-B.

| File | Change / ownership |
|---|---|
| `packages/contracts/src/commands.ts` | NEW — P02-A |
| `packages/contracts/src/state.ts` | NEW — P02-A |
| `packages/contracts/src/errors.ts` | NEW — P02-A |
| `packages/contracts/src/constants.ts` | NEW — P02-A |
| `packages/contracts/src/index.ts` | EXISTING from P01-B; extend export contract |

**Gate:** `npm run typecheck`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P02-B — Pure transitions

Pure deterministic functions: choose/change/withdraw/reveal/clear, observer transitions, immutable reveal, numeric mode, completion marker and no-zero-voter sound. Index EXISTING from P01-B. Tests cover all listed acceptance IDs.

| File | Change / ownership |
|---|---|
| `packages/domain/src/round.ts` | NEW — P02-B |
| `packages/domain/src/mode.ts` | NEW — P02-B |
| `packages/domain/src/projection.ts` | NEW — P02-B |
| `packages/domain/src/presence.ts` | NEW — P02-B |
| `packages/domain/src/index.ts` | EXISTING from P01-B; extend export contract |
| `tests/domain/round.test.ts` | NEW — P02-B |
| `tests/domain/projection.test.ts` | NEW — P02-B |
| `tests/domain/presence.test.ts` | NEW — P02-B |

**Gate:** `npm run test:domain && npm run verify`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Layer 3.1 — Dispatch Table

| Phase | Mode | Dependency | Owner | Files | Gate |
|---|---|---|---|---|---|
| P02-A | Serial | P01 | One executor in isolated worktree | Exact Phase P02-A table (5 files) | `npm run typecheck` |
| P02-B | Serial | P02-A | One executor in isolated worktree | Exact Phase P02-B table (8 files) | `npm run test:domain && npm run verify` |

### Layer 3.2 — UI Flow Matrix

No UI files owned by this plan. Its backend transitions are consumed by the [UI flow matrix](../../docs/ui.md); contract changes must be reconciled there.

## Layer 4 — Patterns Reference

Transition(state, authenticatedMember, command, now) returns either a proposed next snapshot plus effects or a stable error. It performs no IO; server persists before publishing.

Read [acceptance matrix](../../docs/acceptance.md) for negative cases. Test with synthetic names, isolated temporary database and process; do not run destructive fixtures against shared services. Amend the plan when evidence requires a contract change.

## Layer 5 — Meta

Resolved 2026-10-20: this is a planning package for the owner's team. Technology and behavior defaults live in project docs; live OVH facts are not assumed.

Blast radius: 13 implementation file paths, plus serial plan/index/changelog bookkeeping. Implementation completed; see execution evidence below.

Learnings log (append-only): 2026-10-20 — greenfield gates are future outputs; no runtime verification can be claimed during authoring.

Cold-start continuity:
1. Read this plan and its banks; inspect index and actual Git history.
2. Verify dependency P01 and current contract versions; get a clean task worktree.
3. Run phase gates in order, stop on failure, record evidence without sensitive data.
4. Audit requirements and diff; finish lifecycle, archive only completed scope and activate successor.

### Execution evidence

Typecheck, lint, 21 domain tests and full verify (24 tests) passed. Open-state projection secrecy, mode/ties, observer reveal, stale clear and completion edge cases covered.
