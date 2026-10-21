---
id: P06
name: Team launch, OVH isolation and recovery
status: complete
dependencies: [P05]
activation: Owner explicitly requested P06 execution and deployment on 2026-10-20
priority: P1
effort: L
---
# P06 — Team launch, OVH isolation and recovery

## Layer 1 — Core Configuration

Current state: P01–P06 shipped; Fibotable is live at https://fibotable.com from application source cfe300b with passing CI and verified public/recovery evidence. File tables distinguish new operational artifacts from predecessor-owned runtime files; actual verification is recorded in release evidence.

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
| Host isolation | Exact ports/proxy/volumes verified read-only first | VERIFIED including public route | P06-C release evidence | Implementer; owner for release decisions |
| Privacy/legal | Contact, jurisdiction, provider terms, license and data notice owner review | Deployment facts VERIFIED; no blanket legal certification | P06-C release blocker; not blanket compliance | Implementer; owner for release decisions |
| Recovery | Off-host destination and tested restore/deletion replay | Local and actual off-host recovery VERIFIED | T19 T22 | Implementer; owner for release decisions |
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

Acceptance audit refinement before edit: add existing `tests/web/table.test.tsx` to the P06-B-acceptance batch. Its pending/error title previously asserted only the initial selected card; extend it to actual pending and storage-error states, and extend the transport test to a rejected ACK before disconnect/new-round reconciliation. This closes an evidence gap without changing runtime behavior.

P06-B before-edit fault coverage addition: `tests/realtime/crash.test.ts` will inject real SQLite page exhaustion during a vote through a temporary SQL trigger, asserting the WebSocket error ACK and unchanged public/private state, then successful recovery. This expands the primary B inventory to nine files and closes the published-state portion of T13.

### Public-release handoff

Deployment authority is already explicit; do not ask for it again. Source/operational tooling is implemented, but this plan remains active until real public release checks pass.

1. Authenticate the owner's provider session, verify the correct account/zone and confirm the hostname (candidate `poker.agentshorts.dev`). Origin certificate SAN covers the candidate; DNS and edge HTTPS/WSS have not been configured or tested.
2. Confirm the actual OVH hosting region from the provider account and finalize the deployment notice/contact/terms for the owner's team. Build with `VITE_HOSTING_REGION` and `VITE_RELEASE_READY=true` only after the facts are verified.
3. Configure a dedicated private off-host bucket and object credentials in `OFFHOST_CONFIG`, generate `BACKUP_KEY_FILE`, and escrow the key independently of OVH. Never reuse another application's bucket or publish credentials.
4. Build/tag the exact main commit; record its immutable image ID. Deploy only the isolated Compose project/volume and rendered `ops/traefik.yml` as a new file-provider configuration. Preserve other projects and the proxy process.
5. Verify the real encrypted upload/download/restore, latest deletion ledger and daily locked maintenance job; confirm retention/health/disk checks. Same-host fixture backups are not off-host recovery evidence.
6. Run public-origin Playwright MCP smoke with two separate identities: hidden vote, reveal/mode, observer, clear, reconnect, mobile and privacy notice. Confirm Secure cookie/CSP/WSS and sibling health. Do not replace this with SDK-only tests.
7. Reconcile `docs/reviews/launch-evidence.md`, release checklist and this plan; archive only after every remaining blocker is resolved. Keep measured failed baselines alongside the optimized result.

The temporary test servers have no public route. Their synthetic recovery/load evidence is separate from production. Resume from Git/main and inspect actual provider/container state before making any change.

### Verified execution result — 2026-10-20

P06-A and the isolated P06-B gates pass: 72 tests / 25 files, TypeScript/lint, build, 104-key locale parity, bundle budget, Compose, Linux Docker build, local/browser fault scenarios, OVH restart/rollback and separate-volume restore. The original 0.5-CPU soak failed at 508.9 ms p95. After reducing redundant snapshots, the 1-CPU/512-MiB soak completed 1800.015 seconds, 173 rounds and 19,030 successful ACKs with 172.54 ms p95 (326.89 ms maximum), no lost ACKs or room-isolation failures. Twenty disposal cycles retained only 282,128 extra heap bytes after warmup.

P06-C tooling/notice preparation is implemented; provider authentication, actual hosting-region confirmation, off-host bucket/key escrow/job and public notice activation remain unresolved. P06-D has not run: no public launch or URL is claimed. Keep this plan active and use the handoff above. Source changes can land independently of provider configuration; do not describe that merge as a production release.


### Owner branding amendment — 2026-10-21

The owner selected **Fibotable**, with no slogan. Apply the public name consistently and remove promotional entry/footer copy in both locales. Domain selection remains with the owner; do not configure the previously proposed hostname. Existing repository slug, container/volume/router names, cookies and preference keys remain compatibility identifiers, not public branding. No data migration or provider change is part of this amendment.

Audit verdict: ready; presentation-only changes preserve protocol, privacy and persistence boundaries. Execute serial bounded batches:

| Batch | Files | Gate |
|---|---|---|
| Branding UI | `apps/web/index.html`, `apps/web/src/i18n/en.ts`, `apps/web/src/i18n/pt.ts`, `apps/web/src/ui/entry.tsx`, `apps/web/src/app.tsx`, `apps/server/src/main.ts` | `npm run verify && npm run check:i18n && npm run build && npm run check:bundle` |
| Branding metadata/docs | `package.json`, `package-lock.json`, `README.md`, `AGENTS.md`, `docs/privacy-notice.md`, `docs/ui.md`, `tests/browser/scenarios.md` | `npm run verify` plus desktop/mobile browser inspection |

Coordinator updates plan/index/changelog. Preserve historical evidence and compatibility identifiers. No slogan or new domain is introduced.

Branding verification: 72 tests pass, 102 locale keys match, production build and bundle budget pass (92,578 gzip bytes). MCP confirms Fibotable in title/header/footer and functional entry text at 1440/390/360 widths; Portuguese creation reaches the connected table at 360 pixels with no overflow. An initial exact-text browser wait omitted the brand prefix; corrected locator confirmed connection. Cloudflare authentication is now available and the owner purchased **fibotable.com**; use that domain instead of the earlier candidate. DNS currently has no records. OVH region confirmation was requested; backup/provider and public-release gates still apply.


### Provider configuration — 2026-10-21

Owner domain **fibotable.com** verified in the authenticated Cloudflare account. Added a proxied apex A record to the existing OVH host. Issued a dedicated Origin CA certificate from a server-generated CSR (private key remains outside source), installed an isolated certificate configuration through Traefik's watched file provider, and enabled Full (strict). Origin SNI inspection confirms fibotable.com and its wildcard. Public HTTPS reaches the proxy and returns 404 as expected before the application route exists; this is TLS evidence, not a launch.

Created dedicated private R2 bucket `fibotable-backups` (Eastern North America), with no public URL or custom domain. Created an object read/write account token scoped only to that bucket; installed external credential configuration and escrowed the encryption key off OVH. No provider credentials are in the repository. Existing sibling services remain running without restart. A fresh exact-source Linux image is being built because prior synthetic fixture images were no longer present on the host. Actual off-host restore, daily job, verified OVH region and application public-origin smoke remain pending; do not archive P06.


### Launch verification — 2026-10-21

Fibotable is live at https://fibotable.com from application source cfe300b. Immutable release image: `sha256:506c3ae520295324aa205c4477fe43acd73428e70c9eed7c92121426a78dea43`. CI run 39606538018 passed. OVH dashboard confirms Beauharnois (BHS), Canada, os-bhs6. Release build activates the public notice with that fact. Private R2 upload/download and authenticated restore passed for synthetic data and the actual production database. Production restore ciphertext: 57,376 bytes, SHA-256 `7eb38651d985dd5f0f4b625d4adf17f359b02f5cfaf1906fe5e0e41982cccf09`.

Daily maintenance ran successfully twice against production, restarted only this app, and recorded offhost_verified. Cron is installed at 04:15 UTC, with seven-day scoped retention, external key escrow and seven-day maintenance-log rotation. Manual health/disk/backup-age monitoring remains the documented team-scale model; no automatic paging is claimed. Current service is healthy, zero unexpected restarts, 77 GiB disk available. Sibling application and proxy start times/restart counts are unchanged.

Playwright MCP verified independent English desktop and Portuguese mobile identities, hidden values, shared reveal/mode, observer identification/reveal, host clear, browser reload and restored table after daily maintenance. The privacy page has no mobile overflow and shows verified hosting facts. Secure HttpOnly SameSite=Strict cookie and CSP confirmed. Cloudflare's default RUM attempted beacon injection; disabled it in this zone, waited for propagation and confirmed no external scripts on a fresh browser navigation. Initial browser locator failures (combined status label, repeated per-person statuses and server-confirmed switch state) were corrected; they were not app failures. The final optional repeat of observer-clear/socket-event capture was interrupted by MCP Transport closed; prior public round trips and baseline protocol/observer tests remain the evidence. No physical-device/screen-reader certification is claimed.

Release gate reconciliation: application deployment and recovery checks pass for the requested personal team launch. Provider contract references are recorded in the privacy notice; no blanket legal compliance or new license grant is asserted. Important host maintenance finding: OVH labels the existing Ubuntu 25.04 installation end-of-life. A shared-host OS upgrade is outside this isolated release and must be scheduled separately. No shared OS upgrade was attempted.
