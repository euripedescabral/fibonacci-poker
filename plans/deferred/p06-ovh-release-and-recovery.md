---
id: P06
name: Team launch, OVH isolation and recovery
status: deferred
dependencies: [P05]
activation: Predecessor P05 complete and archived; implementation authorized
priority: P1
effort: L
---
# P06 — Team launch, OVH isolation and recovery

## Layer 1 — Core Configuration

Current state: planning-only repository. All runtime files below are **NEW in their listed phase**, except explicit predecessor-owned files. No runtime gate has passed yet.

Objective: deliver team launch, ovh isolation and recovery according to the project contracts.

Requirements: R15 R17 plus all release acceptance. Acceptance coverage: T18 T19 T20 T22 and full matrix.

| Constraint | Rationale |
|---|---|
| Dependencies: P05 | No dispatch until prerequisites are verified and committed |
| One agent, one task worktree | Shared contracts/lockfile make serial implementation safer |
| Initial team/light use | No speculative scale architecture |
| No private workspace exports | Repository is public |

Success: all phase gates pass and the listed acceptance scenarios have actual evidence. Excluded: any new feature beyond the product contract, changes to other projects, and unapproved live deployment.

## Layer 1.5 — Security + Legal Posture

DESIGNED means specified but not implemented; release blockers require owner resolution, not invented risk acceptance.

| Boundary | Control | Status | Required evidence | Owner |
|---|---|---|---|---|
| Host isolation | Exact ports/proxy/volumes verified read-only first | DESIGNED / unverified | P06-C release blocker | Implementer; owner for release decisions |
| Privacy/legal | Contact, jurisdiction, provider terms, license and data notice owner review | DESIGNED / unverified | P06-C release blocker; not blanket compliance | Implementer; owner for release decisions |
| Recovery | Off-host destination and tested restore/deletion replay | DESIGNED / unverified | T19 T22 | Implementer; owner for release decisions |
| Release authority | No deploy from plan approval alone | DESIGNED / unverified | P06-D explicit owner release approval (public GitHub publication is already separately authorized) | Implementer; owner for release decisions |

Privacy and legal lifecycle follows [security contract](../../docs/security.md); relevant controls must be verified in this plan and P06 before release. Payments, tracking, real gambling and emails: N/A, none in scope.

## Layer 1.6 — AI Safety Posture

N/A. No model calls, agents or user-executable tools in application runtime. Development assistants do not make this an AI feature.

## Layer 2 — Methodology Banks

- [docs/security.md](../../docs/security.md) — normative implementation contract.
- [docs/acceptance.md](../../docs/acceptance.md) — normative implementation contract.
- [docs/architecture.md](../../docs/architecture.md) — normative implementation contract.

Key pattern: Backup verified → immutable image deploy → migrate/ready → real-origin smoke → keep prior image. Schema rollback uses tested compatible migrations or controlled restore; never erase volume or blindly run down migrations.

### Team-scale operational defaults

Start with one replica, 512 MiB memory and 0.5 CPU as proposed container limits, subject to measured P06-B results and actual host capacity. These are not reservations on the existing server. No Redis, Kubernetes, autoscaler or high-traffic queue. Confirm daily backup retention 7 days, health/disk monitoring and manual incident/restore owner. Recovery objectives for initial team use: tested process restart recovery within 60 seconds; host-loss recovery target within one business day and at most 24 hours lost data from daily off-host backup. These targets must be approved by owner at release; acknowledge that normal acknowledged writes survive process restart but not destruction of unbacked disk.

## Layer 3 — Command System

Phase 0: read AGENTS/workflow/contracts, reconcile Git history and plan status, create task worktree, run lifecycle begin, capture baseline. P01 establishes runtime commands; later plans use those scripts. Every file table is a closed implementation set; plan bookkeeping belongs to the coordinator.

### Phase P06-A — Container and recovery tooling

Nonroot container, single replica, mounted SQLite volume, migrate before ready, offline restore safeguards, online backup integrity and restricted deletion ledger. No exposed DB/management port. Document deletion/export. Test only temporary DBs; never touch OVH in this phase.

| File | Change / ownership |
|---|---|
| `Dockerfile` | NEW — P06-A |
| `.dockerignore` | NEW — P06-A |
| `compose.yaml` | NEW — P06-A |
| `ops/backup.mjs` | NEW — P06-A |
| `ops/restore.mjs` | NEW — P06-A |
| `ops/privacy.mjs` | NEW — P06-A |
| `tests/ops/backup.test.ts` | NEW — P06-A |
| `tests/ops/privacy.test.ts` | NEW — P06-A |
| `docs/operations.md` | NEW — P06-A |

**Gate:** `npm run test:ops && docker compose config --quiet && docker build -t fibonacci-poker:preflight .`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P06-B — Realistic resilience and load

Run modest 5×20 synthetic clients for 30 minutes; verify one full table, cross-room isolation, plateau on repeated disposal, persistence faults and restart, shutdown and image rollback. Record target vs measured values, not invented pass.

| File | Change / ownership |
|---|---|
| `tests/load/team.mjs` | NEW — P06-B |
| `tests/ops/recovery.test.ts` | NEW — P06-B |
| `docs/reviews/release-evidence.md` | NEW — P06-B |

**Gate:** `npm run test:load && npm run test:recovery && npm run verify`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P06-C — Host inventory and release decision

Read-only OVH inventory and project isolation proposal; resolve domain/contact/region/backup destination/licensing. Wire verified public operator/contact/region data into /privacy using public-notice.ts (public facts only), test both locales, adapt compose.yaml to the inventoried proxy, and write PT/EN privacy/use notice, dependency attribution and exact commands from observed environment. Owner reviews concrete release candidate and approves deployment separately.

| File | Change / ownership |
|---|---|
| `docs/reviews/ovh-preflight.md` | NEW — P06-C |
| `docs/release-checklist.md` | NEW — P06-C |
| `docs/privacy-notice.md` | NEW — P06-C |
| `docs/dependency-licenses.md` | NEW — P06-C |
| `apps/web/src/public-notice.ts` | NEW — P06-C |
| `apps/web/src/ui/privacy.tsx` | EXISTING from P05/P06-A; wire verified release facts |
| `apps/web/src/i18n/pt.ts` | EXISTING from P05/P06-A; wire verified release facts |
| `apps/web/src/i18n/en.ts` | EXISTING from P05/P06-A; wire verified release facts |
| `tests/web/privacy.test.tsx` | NEW — P06-C |
| `compose.yaml` | EXISTING from P05/P06-A; wire verified release facts |

**Gate:** `npm run test:web && npm run build && npm run verify && python3 scripts/check-plans.py`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P06-D — Approved team launch

Only after release approval: backup, deploy isolated project, verify HTTPS/WSS via two synthetic browser participants, rollback rehearsal evidence and no other-project interruption. Do not declare done without actual backup restore and public-origin smoke.

| File | Change / ownership |
|---|---|
| `docs/reviews/launch-evidence.md` | NEW — P06-D |

**Gate:** `npm run test:ops && npm run verify`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Layer 3.1 — Dispatch Table

| Phase | Mode | Dependency | Owner | Files | Gate |
|---|---|---|---|---|---|
| P06-A | Serial | P05 | One executor in isolated worktree | Exact Phase P06-A table (9 files) | `npm run test:ops && docker compose config --quiet && docker build -t fibonacci-poker:preflight .` |
| P06-B | Serial | P06-A | One executor in isolated worktree | Exact Phase P06-B table (3 files) | `npm run test:load && npm run test:recovery && npm run verify` |
| P06-C | Serial | P06-B | One executor in isolated worktree | Exact Phase P06-C table (10 files) | `npm run test:web && npm run build && npm run verify && python3 scripts/check-plans.py` |
| P06-D | Serial | P06-C | One executor in isolated worktree | Exact Phase P06-D table (1 files) | `npm run test:ops && npm run verify` |

### Layer 3.2 — UI Flow Matrix

[Complete mutation matrix](../../docs/ui.md#layer-32--ui-flow-matrix) applies to every frontend phase. Execute all entry, pending, success, error, role and keyboard states; P06 adds the final bilingual use/privacy notice.

## Layer 4 — Patterns Reference

Backup verified → immutable image deploy → migrate/ready → real-origin smoke → keep prior image. Schema rollback uses tested compatible migrations or controlled restore; never erase volume or blindly run down migrations.

Read [acceptance matrix](../../docs/acceptance.md) for negative cases. Test with synthetic names, isolated temporary database and process; do not run destructive fixtures against shared services. Amend the plan when evidence requires a contract change.

## Layer 5 — Meta

Resolved 2026-10-20: this is a planning package for the owner's team. Technology and behavior defaults live in project docs; live OVH facts are not assumed.

Blast radius: 22 implementation file paths, plus serial plan/index/changelog bookkeeping. No files created by this plan yet.

Learnings log (append-only): 2026-10-20 — greenfield gates are future outputs; no runtime verification can be claimed during authoring.

Cold-start continuity:
1. Read this plan and its banks; inspect index and actual Git history.
2. Verify dependency P05 and current contract versions; get a clean task worktree.
3. Run phase gates in order, stop on failure, record evidence without sensitive data.
4. Audit requirements and diff; finish lifecycle, archive only completed scope and activate successor.
