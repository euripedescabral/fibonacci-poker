---
id: P06
name: Team launch, OVH isolation and recovery
status: in-progress
dependencies: [P05]
activation: Owner explicitly requested P06 execution and deployment on 2026-10-20
priority: P1
effort: L
---
# P06 — Team launch, OVH isolation and recovery

## Layer 1 — Core Configuration

Current state: P01–P05 shipped at 503f2dd; P06 implementation commit b843ff7 has passing GitHub CI. P06 implementation is in progress in the isolated release worktree. File tables distinguish new operational artifacts from predecessor-owned runtime files; actual verification is recorded in release evidence.

Objective: deliver team launch, ovh isolation and recovery according to the project contracts.

Requirements: R15 R17 plus all release acceptance. Acceptance coverage: T18 T19 T20 T22 and full matrix.

| Constraint | Rationale |
|---|---|
| Dependencies: P05 | No dispatch until prerequisites are verified and committed |
| One agent, one task worktree | Shared contracts/lockfile make serial implementation safer |
| Initial team/light use | No speculative scale architecture |
| No private workspace exports | Repository is public |

Success: all phase gates pass and the listed acceptance scenarios have actual evidence. Excluded: any new feature beyond the product contract and changes to other projects. The owner explicitly authorized live deployment; provider access and release checks still apply.

## Layer 1.5 — Security + Legal Posture

DESIGNED means specified but not implemented; release blockers require owner resolution, not invented risk acceptance.

| Boundary | Control | Status | Required evidence | Owner |
|---|---|---|---|---|
| Host isolation | Exact ports/proxy/volumes verified read-only first | VERIFIED for isolated fixtures; public route pending | P06-C release evidence | Implementer; owner for release decisions |
| Privacy/legal | Contact, jurisdiction, provider terms, license and data notice owner review | DESIGNED / unverified | P06-C release blocker; not blanket compliance | Implementer; owner for release decisions |
| Recovery | Off-host destination and tested restore/deletion replay | Local recovery VERIFIED; off-host authentication BLOCKED | T19 T22 | Implementer; owner for release decisions |
| Release authority | Explicit deployment instruction | AUTHORIZED 2026-10-20 | Owner requested deployment and then execution of this plan | Implementer; owner for release decisions |

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
| `apps/server/src/main.ts` | EXISTING — container host binding |

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

### Phase P06-C-ops — Backup transport and notice delivery

Serial operational subphase, prepared while the load soak runs. Its public activation remains gated by P06-B/C.

| File | Change / ownership |
|---|---|
| `ops/offhost.mjs` | NEW — verified private S3 upload/download and scoped retention |
| `ops/daily-backup.sh` | NEW — locked expiry/backup job |
| `ops/traefik.yml` | NEW — isolated route template, not installed yet |
| `apps/web/public/assets/third-party-notices.txt` | NEW — distributed dependency notices |
| `apps/server/src/http/static.ts` | EXISTING — readable, revalidated text notice |
| `tests/realtime/http.test.ts` | EXISTING — notice delivery regression |

**Gate:** `npm run test:ops && npm run test:realtime && npm run build`.

### Phase P06-D — Approved team launch

Only after release approval: backup, deploy isolated project, verify HTTPS/WSS via two synthetic browser participants, rollback rehearsal evidence and no other-project interruption. Do not declare done without actual backup restore and public-origin smoke.

| File | Change / ownership |
|---|---|
| `docs/reviews/launch-evidence.md` | NEW — P06-D |

**Gate:** `npm run test:ops && npm run verify`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Layer 3.1 — Dispatch Table

| Phase | Mode | Dependency | Owner | Files | Gate |
|---|---|---|---|---|---|
| P06-A | Serial | P05 | One executor in isolated worktree | Exact Phase P06-A table (10 files) | `npm run test:ops && docker compose config --quiet && docker build -t fibonacci-poker:preflight .` |
| P06-B | Serial | P06-A | One executor in isolated worktree | Exact Phase P06-B table (3 files) | `npm run test:load && npm run test:recovery && npm run verify` |
| P06-C | Serial | P06-B | One executor in isolated worktree | Exact Phase P06-C table (10 files) | `npm run test:web && npm run build && npm run verify && python3 scripts/check-plans.py` |
| P06-C-ops | Serial | P06-B | One executor in isolated worktree | Exact operational subphase table (6 files) | `npm run test:ops && npm run test:realtime && npm run build` |
| P06-D | Serial | P06-C, P06-C-ops | One executor in isolated worktree | Exact Phase P06-D table (1 files) | `npm run test:ops && npm run verify` |

### Layer 3.2 — UI Flow Matrix

[Complete mutation matrix](../../docs/ui.md#layer-32--ui-flow-matrix) applies to every frontend phase. Execute all entry, pending, success, error, role and keyboard states; P06 adds the final bilingual use/privacy notice.

## Layer 4 — Patterns Reference

Backup verified → immutable image deploy → migrate/ready → real-origin smoke → keep prior image. Schema rollback uses tested compatible migrations or controlled restore; never erase volume or blindly run down migrations.

Read [acceptance matrix](../../docs/acceptance.md) for negative cases. Test with synthetic names, isolated temporary database and process; do not run destructive fixtures against shared services. Amend the plan when evidence requires a contract change.

## Layer 5 — Meta

Resolved 2026-10-20: this is a planning package for the owner's team. Technology and behavior defaults live in project docs; live OVH facts are not assumed.

Blast radius: original operational scope plus the explicitly listed serial amendments and coordinator status documents. Implementation files now exist; live public routing/provider configuration remains pending.

Learnings log (append-only): 2026-10-20 — greenfield gates are future outputs; no runtime verification can be claimed during authoring.

Cold-start continuity:
1. Read this plan and its banks; inspect index and actual Git history.
2. Verify dependency P05 and current contract versions; get a clean task worktree.
3. Run phase gates in order, stop on failure, record evidence without sensitive data.
4. Audit requirements and diff; finish lifecycle, archive only completed scope and activate successor.

### Execution audit — 2026-10-20

P01–P05 are at 503f2dd. Owner now explicitly authorizes P06 and deployment; this supersedes older separate-confirmation prose. Serial execution remains. Phase 0 obtains read-only infrastructure facts early. OVH inventory verified Docker 29.2.1, Traefik 3.6.7, external dokploy-network, 78 GiB disk and roughly 9 GiB available memory. Domain preference requested asynchronously. Keep the current no-license-grant policy; do not invent contact or provider region facts.

Before-edit scope refinements: P06-A also owns apps/server/src/main.ts (container host binding), shared manifests and CI configuration. Local Docker Desktop is unresponsive: use an isolated image/preflight container/directory on the authorized OVH host if necessary, without exposing routes or altering sibling projects. P06-B may add regression cases to existing test files to close disclosed gaps. Register extra routing/scheduling files before P06-C edits. Backup keys/authentication material remain outside Git and output. Deploy authority is settled; actual recovery/privacy/routing evidence remains mandatory.

Audit verdict: ready for implementation, with domain/off-host backup facts to resolve before release. References checked: SQLite online backup API and Docker multi-stage/nonroot image guidance, from official documentation. No private vault material is part of the public project.

P06-B scope addition before edit: `tests/load/disposal.mjs` and `tests/ops/container-recovery.mjs` provide repeatable runtime-disposal and real container restart/rollback fixtures. They use synthetic isolated data only. Public DNS and an off-host backup destination require existing provider authentication; an async access request is pending. Implementation and isolated verification continue independently.

P06-C exact operational additions before edit: `ops/offhost.mjs`, `ops/daily-backup.sh`, and `ops/traefik.yml` (routing template only until DNS is verified). The off-host adapter uses the official S3 SDK, pinned in the already coordinator-owned manifests, to support a dedicated private bucket; provider credentials stay external. `tests/ops/backup.test.ts` additionally covers rejected upload/download verification. These are a separate serial operations subphase with `npm run test:ops` as gate, keeping implementation batches bounded.

P06-C notice addition before edit: `apps/web/public/assets/third-party-notices.txt` distributes dependency license/copyright notices with the browser build. It belongs to the bounded operational subphase. Documentation, provider discovery and fixture preparation may proceed while the long P06-B load runs; no launch can pass until B and C evidence is complete. This changes preparation scheduling, not release gates or serial file ownership.

Notice delivery refinement before edit: the operational subphase also owns `apps/server/src/http/static.ts` plus the existing `tests/realtime/http.test.ts` for a readable, revalidated text notice. Hashed JS/CSS keep immutable caching; the fixed-name legal text must not remain stale for a year.

Verification reconciliation: A includes container host binding; shared package/lockfile, TypeScript and CI edits are a separate serial configuration batch. B regression ownership includes existing HTTP/concurrency/reconnect/storage tests and two isolated fixture runners. All edits are by one executor. Off-host access and public DNS remain pending; do not archive the plan or describe a public launch as complete.

### Measured performance remediation — before edit

The 1-CPU calibration with 100 concurrent synthetic voters measured p95 362.9 ms, failing the 200 ms gate. Each vote currently sends an entire public snapshot plus private state to all 20 members, in addition to Colyseus public patches. Add a bounded serial P06-B remediation batch owning `apps/server/src/rooms/table-room.ts`, existing realtime tests and `compose.yaml`. Send immediate private confirmation only to the acting client for individual actions; preserve full synchronization on reveal/clear and Colyseus public patches for peers. Validate the entire realtime suite and repeat the actual load measurement. Resource defaults may move to 1 CPU only on measured evidence; no gate threshold is relaxed.

P06-B browser-fixture addition before edit: `tests/browser/idle-fixture.mjs` is an isolated in-memory server whose clock advances through operator stdin. Browser interactions stay in Playwright MCP. Existing `tests/web/connection.test.ts` additionally verifies pending-disconnect/new-round reconciliation. Split these two files into a serial acceptance follow-up batch with `npm run test:web` and the recorded MCP idle scenario as gates.

### Exact supplemental batch inventories

These inventories reconcile the before-edit amendments above. They execute serially; no extra agent or parallel ownership is introduced.

| Batch | Files | Gate |
|---|---|---|
| P06-config | `package.json`, `package-lock.json`, `tsconfig.base.json`, `.github/workflows/ci.yml` | `npm run verify` |
| P06-B extra fixtures/regressions | `tests/load/disposal.mjs`, `tests/ops/container-recovery.mjs`, `tests/realtime/races.test.ts`, `tests/realtime/reconnect.test.ts`, `tests/storage/transactions.test.ts` | `npm run test:realtime && npm run test:storage && npm run test:recovery` |
| P06-B-perf | `apps/server/src/rooms/table-room.ts`, `compose.yaml` | `npm run test:realtime && npm run test:load` |
| P06-B-acceptance | `tests/web/connection.test.ts`, `tests/browser/idle-fixture.mjs`, `tests/browser/scenarios.md` | `npm run test:web` plus recorded MCP idle scenario |

The primary B batch plus its five extra files totals eight files; each supplemental batch is below the ten-file limit. Shared files are revisited only serially. Manifest and plan now enumerate the same scope.

Before-edit hardening refinement: add `.gitignore` to the serial configuration batch and exclude `private/`, `ledger/`, key/ciphertext files and fixture directories from Git/build contexts. Operator keys and deletion ledger must never be accidentally staged or baked into an image. This is scope-specific to the new maintenance files.

Coordinator status reconciliation before edit: update `README.md`, `docs/acceptance.md` and `docs/security.md` to distinguish implemented operational gates from remaining public-release blockers. No product/security contract is relaxed; these files currently still describe pre-P06 or planning-only state.
