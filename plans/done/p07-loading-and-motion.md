---
id: P07
name: Loading lifecycle and lightweight motion
status: complete
dependencies: [P06]
activation: Owner requested frontend loading and animation fixes
priority: P1
effort: M
---
# P07 — Loading lifecycle and lightweight motion

## Layer 1 — Core Configuration
Fix incorrect creation labels during session preparation, unstyled startup, restored-table entry flashes, and unbounded initial socket synchronization. Keep Preact, mobile layouts and the existing server protocol. No animation dependency or redesign. Success: distinct bootstrap/submit/restore/reconnect/error states, recoverable failures, private cards unchanged, deterministic loading tests and production health.

## Layer 1.5 — Security + Legal Posture
Existing same-origin CSP and HttpOnly identity remain unchanged. Static recovery works without inline script/style or remote assets. No credentials, participant data or internal notes enter artifacts. Owner: coordinator. Gate: source boundaries, integration tests and public readiness.

## Layer 1.6 — AI Safety Posture
N/A: no AI runtime.

## Layer 2 — Methodology Banks
[UI contract](../../docs/ui.md), [protocol](../../docs/protocol.md), [operations](../../docs/operations.md). Public references checked 2026-10-21: [animation performance](https://web.dev/articles/animations-and-performance) and [accessible status messages](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22.html). Use compositor-friendly properties and polite status announcements; no animation-library migration.

## Layer 3 — Command System
### Phase 1 — Bootstrap and loading states
- `apps/web/src/app.tsx`
- `apps/web/src/main.tsx`
- `apps/web/src/ui/loading.tsx` — NEW
- `apps/web/src/ui/entry.tsx`
- `apps/web/src/styles/boot.css` — NEW
- `apps/web/index.html`
- `apps/web/vite.config.ts`
- `apps/web/src/i18n/en.ts`
- `apps/web/src/i18n/pt.ts`
- `tests/web/loading.test.tsx` — NEW
Gate: `npm run verify && npm run check:i18n && npm run build && npm run check:bundle`.
### Phase 2 — Motion and connection robustness
- `apps/web/src/styles/app.css`
- `apps/web/src/preferences/store.ts`
- `apps/web/src/connection/client.ts`
- `tests/web/connection.test.ts`
- `tests/web/preferences.test.ts`
- `tests/browser/scenarios.md`
Gate: `npm run verify && npm run check:i18n && npm run build && npm run check:bundle`.

### Layer 3.1 — Dispatch Table
| Phase | Mode | Dependency | Owner | Files | Gate |
|---|---|---|---|---|---|
| 1 | Serial | P06 | Coordinator | Phase 1 inventory | Full gates above |
| 2 | Serial | Phase 1 | Coordinator | Phase 2 inventory | Full gates above |
Coordinator maintains this plan, manifest, checker/index, changelog and release evidence. Replace the checker's historical six-plan assumption with inventory consistency when adding P07.

### Layer 3.2 — UI Flow Matrix
| Flow | Pending PT/EN | Success | Error/recovery | Mobile/accessibility |
|---|---|---|---|---|
| Bootstrap | Preparando / Getting ready | Entry or saved table | Retry initialization / home for missing table | Stable centered shell, polite status |
| Submit | Criando/Entrando / Creating/Joining | Confirmed table | Retain typed name, retry | No forced keyboard, guard duplicate submit |
| Restore | Carregando a mesa / Loading table | Confirmed table, no form flash | Retry/reload/home | Same shell geometry |
| Reconnect | Reconectando / Reconnecting | Preserve table and private vote | Explicit retry after bounded attempts | Existing table stays visible, controls disabled |
| Motion | CSS only, brief feedback | Selection/card status | Reduced motion still readable | OS + explicit reduction, fine-pointer hover only |

## Layer 4 — Patterns Reference
Bootstrap CSS loads independently of application JS. No fake progress or minimum loading delay. Dynamic app import leaves a localized recovery shell on failure. Only real pending work gets a loading label. Connection deadline invalidates stale generations; late rooms close. Small transform/opacity transitions, no animated paint properties or global layer promotion.

## Layer 5 — Meta
Baseline: 42b81e8, 75 tests. Audit findings verified against source. No browser visual/FPS claim while Playwright MCP reports Transport closed; use rendered-component, timer, build/HTTP proof and leave explicit browser replay. Production deployment is authorized by the ongoing owner request. Rollback: fibotable:42b81e8-release, same persistent volume. Implementation and deterministic gates complete. Deployed source 7363628 as fibotable:7363628-release; container healthy, public bootstrap/application assets and readiness passed, followed by 25 successful production SDK commands. Visual/physical-device/performance-trace limitations remain explicit in the audit.
