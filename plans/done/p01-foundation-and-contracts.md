---
id: P01
name: Foundation and executable gates
status: complete
dependencies: []
activation: Implementation explicitly authorized
priority: P1
effort: M
---
# P01 — Foundation and executable gates

## Layer 1 — Core Configuration

Current state: planning-only repository. All runtime files below are **NEW in their listed phase**, except explicit predecessor-owned files. No runtime gate has passed yet.

Objective: deliver foundation and executable gates according to the project contracts.

Requirements: R01–R18 (shared foundation). Acceptance coverage: Foundation smoke and command existence; no product acceptance yet.

| Constraint | Rationale |
|---|---|
| Dependencies: none | No dispatch until prerequisites are verified and committed |
| One agent, one task worktree | Shared contracts/lockfile make serial implementation safer |
| Initial team/light use | No speculative scale architecture |
| No private workspace exports | Repository is public |

Success: all phase gates pass and the listed acceptance scenarios have actual evidence. Excluded: any new feature beyond the product contract, changes to other projects, and unapproved live deployment.

## Layer 1.5 — Security + Legal Posture

DESIGNED means specified but not implemented; release blockers require owner resolution, not invented risk acceptance.

| Boundary | Control | Status | Required evidence | Owner |
|---|---|---|---|---|
| Supply chain | Pin lockfile and compatible SDK family; license and advisory review | DESIGNED / unverified | P01-C docs/toolchain.md + npm audit | Implementer; owner for release decisions |
| Secrets | No real .env or private files in Git/client variables | DESIGNED / unverified | P01-C pattern gate | Implementer; owner for release decisions |
| Runtime privacy | No production data introduced during bootstrap | DESIGNED / unverified | N/A; synthetic fixtures only | Implementer; owner for release decisions |

Privacy and legal lifecycle follows [security contract](../../docs/security.md); relevant controls must be verified in this plan and P06 before release. Payments, tracking, real gambling and emails: N/A, none in scope.

## Layer 1.6 — AI Safety Posture

N/A. No model calls, agents or user-executable tools in application runtime. Development assistants do not make this an AI feature.

## Layer 2 — Methodology Banks

- [docs/architecture.md](../../docs/architecture.md) — normative implementation contract.
- [docs/protocol.md](../../docs/protocol.md) — normative implementation contract.
- [docs/references.md](../../docs/references.md) — normative implementation contract.

Key pattern: Install tested packages once, then npm ci from a clean checkout. CI runs the same verify command as local pre-push; configure Node tests by default and jsdom only for tests/web; missing scripts or empty expected suites fail.

### Command contract created by P01

Root scripts: `typecheck` (all workspaces), `lint`, `test` (Vitest run), `verify` (pattern checks + typecheck + lint + existing tests + documentation gate), `test:domain` (domain suite), `test:storage` (storage suite), `test:realtime` (real SDK integration suite), `test:web` (component/unit suite), `check:i18n`, `check:bundle`, `build` (web/server), `dev` (same-origin local integration), `test:load`, `test:recovery`, `test:ops`. Focused scripts may initially fail because their tests are not built yet; README must say which plan provides each. They must never be included as fake passing suites. No package scripts exist at plan-authoring time.

Minimal framework adapter feasibility proof in P01-C: resolve client/server/schema exports under selected versions, prove Node can open a temporary SQLite database, and compile a temporary Preact fixture with the selected Vite preset (fixture is created/removed by tests/foundation.test.ts; no app entrypoint required yet). Any incompatibility is corrected in the plan/lockfile before P02; do not assume online docs match an older installed major.

## Layer 3 — Command System

Phase 0: read AGENTS/workflow/contracts, reconcile Git history and plan status, create task worktree, run lifecycle begin, capture baseline. P01 establishes runtime commands; later plans use those scripts. Every file table is a closed implementation set; plan bookkeeping belongs to the coordinator.

### Phase P01-A — Workspace and toolchain

Pin compatible Node 24 LTS patch, npm, Preact/Vite/TypeScript, Colyseus client/server/schema, better-sqlite3, Zod, cookie, Vitest, jsdom and @testing-library/preact versions. Use npm workspaces. Record compatibility and licenses; install no canvas renderer. Environment example contains names/placeholders only.

| File | Change / ownership |
|---|---|
| `package.json` | NEW — P01-A |
| `package-lock.json` | NEW — P01-A |
| `.node-version` | NEW — P01-A |
| `tsconfig.base.json` | NEW — P01-A |
| `eslint.config.js` | NEW — P01-A |
| `.env.example` | NEW — P01-A |

**Gate:** `npm ci && npm exec tsc -- --version`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P01-B — Package boundaries

Create empty typed package boundaries (no fake feature implementation); runnable compilation/test baseline. Because package manifests are introduced here, refresh the EXISTING root package-lock.json before the phase gate; reserve the lockfile as coordinator-owned bookkeeping. Empty app packages typecheck their configuration until source files exist; foundation tests prove real compiler/library imports in C. Single root lockfile owned serially. Set each workspace test command to fail if invoked with absent tests.

| File | Change / ownership |
|---|---|
| `packages/contracts/package.json` | NEW — P01-B |
| `packages/contracts/tsconfig.json` | NEW — P01-B |
| `packages/contracts/src/index.ts` | NEW — P01-B |
| `packages/domain/package.json` | NEW — P01-B |
| `packages/domain/tsconfig.json` | NEW — P01-B |
| `packages/domain/src/index.ts` | NEW — P01-B |
| `apps/server/package.json` | NEW — P01-B |
| `apps/server/tsconfig.json` | NEW — P01-B |
| `apps/web/package.json` | NEW — P01-B |
| `apps/web/tsconfig.json` | NEW — P01-B |

**Gate:** `npm run typecheck`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P01-C — Quality command contract

Create command contract below, security regression static gates and CI. Test framework can run the foundation suite now; subsequent focused suites are introduced by their owning plan. npm run verify covers existing tests and never fabricates success. Hook install uses git common config safely; no bypass.

| File | Change / ownership |
|---|---|
| `vitest.config.ts` | NEW — P01-C |
| `scripts/check-patterns.mjs` | NEW — P01-C |
| `scripts/check-i18n.mjs` | NEW — P01-C |
| `scripts/check-bundle.mjs` | NEW — P01-C |
| `.github/workflows/ci.yml` | NEW — P01-C |
| `tests/foundation.test.ts` | NEW — P01-C |
| `docs/toolchain.md` | NEW — P01-C |
| `scripts/install-hooks.sh` | NEW — P01-C |
| `.githooks/pre-push` | NEW — P01-C |

**Gate:** `npm run verify && python3 scripts/check-plans.py`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Layer 3.1 — Dispatch Table

| Phase | Mode | Dependency | Owner | Files | Gate |
|---|---|---|---|---|---|
| P01-A | Serial | none | One executor in isolated worktree | Exact Phase P01-A table (6 files) | `npm ci && npm exec tsc -- --version` |
| P01-B | Serial | P01-A | One executor in isolated worktree | Exact Phase P01-B table (10 files) | `npm run typecheck` |
| P01-C | Serial | P01-B | One executor in isolated worktree | Exact Phase P01-C table (9 files) | `npm run verify && python3 scripts/check-plans.py` |

### Layer 3.2 — UI Flow Matrix

No UI files owned by this plan. Its backend transitions are consumed by the [UI flow matrix](../../docs/ui.md); contract changes must be reconciled there.

## Layer 4 — Patterns Reference

Install tested packages once, then npm ci from a clean checkout. CI runs the same verify command as local pre-push; configure Node tests by default and jsdom only for tests/web; missing scripts or empty expected suites fail.

Read [acceptance matrix](../../docs/acceptance.md) for negative cases. Test with synthetic names, isolated temporary database and process; do not run destructive fixtures against shared services. Amend the plan when evidence requires a contract change.

## Layer 5 — Meta

Resolved 2026-10-20: this is a planning package for the owner's team. Technology and behavior defaults live in project docs; live OVH facts are not assumed.

Blast radius: 25 implementation file paths, plus serial plan/index/changelog bookkeeping. Implementation completed; see execution evidence below.

Learnings log (append-only): 2026-10-20 — greenfield gates are future outputs; no runtime verification can be claimed during authoring.

Cold-start continuity:
1. Read this plan and its banks; inspect index and actual Git history.
2. Verify dependency none and current contract versions; get a clean task worktree.
3. Run phase gates in order, stop on failure, record evidence without sensitive data.
4. Audit requirements and diff; finish lifecycle, archive only completed scope and activate successor.

2026-10-20 execution: Node 24.18.0; P01-A npm ci/TypeScript and native SQLite passed.

### Execution evidence

npm ci, TypeScript 6 typecheck, ESLint, native SQLite + Preact build smoke and 3 foundation tests passed; npm audit: zero vulnerabilities. No product behavior claimed by foundation tests.
