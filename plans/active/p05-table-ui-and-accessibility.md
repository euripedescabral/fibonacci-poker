---
id: P05
name: Poker table UI, localization and preferences
status: in-progress
dependencies: [P04]
activation: Predecessor P04 complete and archived; implementation authorized
priority: P1
effort: L
---
# P05 — Poker table UI, localization and preferences

## Layer 1 — Core Configuration

Current state: planning-only repository. All runtime files below are **NEW in their listed phase**, except explicit predecessor-owned files. No runtime gate has passed yet.

Objective: deliver poker table ui, localization and preferences according to the project contracts.

Requirements: R01–R18. Acceptance coverage: T08 T09 T10 T15 T17 T21 T24 plus browser T01 T04 T06.

| Constraint | Rationale |
|---|---|
| Dependencies: P04 | No dispatch until prerequisites are verified and committed |
| One agent, one task worktree | Shared contracts/lockfile make serial implementation safer |
| Initial team/light use | No speculative scale architecture |
| No private workspace exports | Repository is public |

Success: all phase gates pass and the listed acceptance scenarios have actual evidence. Excluded: any new feature beyond the product contract, changes to other projects, and unapproved live deployment.

## Layer 1.5 — Security + Legal Posture

DESIGNED means specified but not implemented; release blockers require owner resolution, not invented risk acceptance.

| Boundary | Control | Status | Required evidence | Owner |
|---|---|---|---|---|
| XSS | Plain-text names and original inline static SVG only | DESIGNED / unverified | T21 | Implementer; owner for release decisions |
| Accessibility | Keyboard/focus/zoom/motion/audio alternative | DESIGNED / unverified | T08 T10 T17 | Implementer; owner for release decisions |
| Privacy | No cookie secret in JS storage; own vote private; no analytics | DESIGNED / unverified | T03 T24 | Implementer; owner for release decisions |
| Consent/use notice | PT/EN explain link capability and data before joining | DESIGNED / unverified | P06 final operator/privacy facts; release blocker | Implementer; owner for release decisions |

Privacy and legal lifecycle follows [security contract](../../docs/security.md); relevant controls must be verified in this plan and P06 before release. Payments, tracking, real gambling and emails: N/A, none in scope.

## Layer 1.6 — AI Safety Posture

N/A. No model calls, agents or user-executable tools in application runtime. Development assistants do not make this an AI feature.

## Layer 2 — Methodology Banks

- [docs/ui.md](../../docs/ui.md) — normative implementation contract.
- [docs/product.md](../../docs/product.md) — normative implementation contract.
- [docs/protocol.md](../../docs/protocol.md) — normative implementation contract.

Key pattern: Render only server-confirmed public state. Optimistic own-card feedback is marked pending and rolls back on error. Never reveal a local aggregate before the server transitions the round.


## Layer 3 — Command System

Phase 0: read AGENTS/workflow/contracts, reconcile Git history and plan status, create task worktree, run lifecycle begin, capture baseline. P01 establishes runtime commands; later plans use those scripts. Every file table is a closed implementation set; plan bookkeeping belongs to the coordinator.

### Phase P05-A — Frontend foundation and localization

Set Vite Preact preset, same-origin dev proxy, routing home/table, dark table tokens, complete localized UI keys and parity. No UI text hardcoded. Use contracts as truth.

| File | Change / ownership |
|---|---|
| `apps/web/index.html` | NEW — P05-A |
| `apps/web/vite.config.ts` | NEW — P05-A |
| `apps/web/src/main.tsx` | NEW — P05-A |
| `apps/web/src/app.tsx` | NEW — P05-A |
| `apps/web/src/styles/tokens.css` | NEW — P05-A |
| `apps/web/src/styles/app.css` | NEW — P05-A |
| `apps/web/src/i18n/pt.ts` | NEW — P05-A |
| `apps/web/src/i18n/en.ts` | NEW — P05-A |
| `apps/web/src/i18n/index.ts` | NEW — P05-A |
| `tests/web/i18n.test.ts` | NEW — P05-A |

**Gate:** `npm run test:web && npm run check:i18n && npm run build`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P05-B — Connection and personal settings

Reconnect/backoff bounded at 30 sec with jitter and six-attempt limit, one in-flight command, durable per-table sequence reconciled on join, own-vote state private; protocol/chunk mismatch presents Reload recovery. Idle never auto-reconnects until interaction. Sound unlock/dedup/mute and reduced-motion system override.

| File | Change / ownership |
|---|---|
| `apps/web/src/connection/client.ts` | NEW — P05-B |
| `apps/web/src/connection/activity.ts` | NEW — P05-B |
| `apps/web/src/connection/commands.ts` | NEW — P05-B |
| `apps/web/src/preferences/store.ts` | NEW — P05-B |
| `apps/web/src/preferences/audio.ts` | NEW — P05-B |
| `apps/web/src/preferences/motion.ts` | NEW — P05-B |
| `tests/web/connection.test.ts` | NEW — P05-B |
| `tests/web/preferences.test.ts` | NEW — P05-B |

**Gate:** `npm run test:web && npm run verify`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P05-C — Table controls and original assets

Implement product layout, all flows from UI matrix, 20-person mobile grid, observers strip, own selection and pending/rollback state, fictional SVGs. Accessible semantics and no observer vote button. Add /privacy and link from entry/settings; generic bilingual capability/storage notice is visible now. Operator/contact/region values remain explicitly unreleased until P06-C supplies verified data; no invented contact details. Suit choice shared, prefs personal.

| File | Change / ownership |
|---|---|
| `apps/web/src/ui/entry.tsx` | NEW — P05-C |
| `apps/web/src/ui/table.tsx` | NEW — P05-C |
| `apps/web/src/ui/card.tsx` | NEW — P05-C |
| `apps/web/src/ui/deck.tsx` | NEW — P05-C |
| `apps/web/src/ui/roster.tsx` | NEW — P05-C |
| `apps/web/src/ui/settings.tsx` | NEW — P05-C |
| `apps/web/src/ui/result.tsx` | NEW — P05-C |
| `apps/web/src/ui/suits.tsx` | NEW — P05-C |
| `tests/web/table.test.tsx` | NEW — P05-C |
| `apps/web/src/ui/privacy.tsx` | NEW — P05-C |

**Gate:** `npm run test:web && npm run check:i18n && npm run build`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Phase P05-D — Browser evidence and bundle

Execute all matrix rows in PT/EN and three sizes through Playwright MCP; multiple participants isolated. Confirm no secret hidden DOM, blocked-storage fallback, no-motion, audio restriction and offline recovery. Record synthetic evidence and bundle size. Amend concrete UI files serially if defects found.

| File | Change / ownership |
|---|---|
| `tests/browser/scenarios.md` | NEW — P05-D |
| `docs/reviews/ui-acceptance.md` | NEW — P05-D |

**Gate:** `npm run check:bundle && npm run verify`. Requires scripts created by P01; a missing script/test is a failure, never a skipped pass.

### Layer 3.1 — Dispatch Table

| Phase | Mode | Dependency | Owner | Files | Gate |
|---|---|---|---|---|---|
| P05-A | Serial | P04 | One executor in isolated worktree | Exact Phase P05-A table (10 files) | `npm run test:web && npm run check:i18n && npm run build` |
| P05-B | Serial | P05-A | One executor in isolated worktree | Exact Phase P05-B table (8 files) | `npm run test:web && npm run verify` |
| P05-C | Serial | P05-B | One executor in isolated worktree | Exact Phase P05-C table (10 files) | `npm run test:web && npm run check:i18n && npm run build` |
| P05-D | Serial | P05-C | One executor in isolated worktree | Exact Phase P05-D table (2 files) | `npm run check:bundle && npm run verify` |

### Layer 3.2 — UI Flow Matrix

[Complete mutation matrix](../../docs/ui.md#layer-32--ui-flow-matrix) applies to every frontend phase. Execute all entry, pending, success, error, role and keyboard states; P06 adds the final bilingual use/privacy notice.

## Layer 4 — Patterns Reference

Render only server-confirmed public state. Optimistic own-card feedback is marked pending and rolls back on error. Never reveal a local aggregate before the server transitions the round.

Read [acceptance matrix](../../docs/acceptance.md) for negative cases. Test with synthetic names, isolated temporary database and process; do not run destructive fixtures against shared services. Amend the plan when evidence requires a contract change.

## Layer 5 — Meta

Resolved 2026-10-20: this is a planning package for the owner's team. Technology and behavior defaults live in project docs; live OVH facts are not assumed.

Blast radius: 30 implementation file paths, plus serial plan/index/changelog bookkeeping. No files created by this plan yet.

Learnings log (append-only): 2026-10-20 — greenfield gates are future outputs; no runtime verification can be claimed during authoring.

Cold-start continuity:
1. Read this plan and its banks; inspect index and actual Git history.
2. Verify dependency P04 and current contract versions; get a clean task worktree.
3. Run phase gates in order, stop on failure, record evidence without sensitive data.
4. Audit requirements and diff; finish lifecycle, archive only completed scope and activate successor.
