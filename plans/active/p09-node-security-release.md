---
id: P09
name: Patch Node runtime and dependency security
status: in-progress
dependencies: [P08]
activation: Owner requested security updates and production deployment
priority: P0
effort: S
---
# P09 — Node security release

## Layer 1 — Core Configuration

Production uses Node 24.18.0. The October 21, 2026 Node security release fixes high severity DNS, TLS and Brotli issues in 24.22.1. The locked Express dependency includes body-parser below 2.4.0, affected by compressed-body denial of service.

Ship a reproducible Node 24.22.1 build, patched dependency lock and production verification. Preserve existing tables, volumes, secrets, proxy routes and sibling applications. Work in an isolated task worktree and merge fast-forward with existing hooks.

Success: clean install, full verify, locale/build/bundle gates, zero npm advisories, healthy production container reporting the patched runtime, and HTTPS/WSS synthetic table verification. No database or UI contract changes.

## Layer 1.5 — Security + Legal Posture

| Control | Status | Evidence / gate | Owner |
|---|---|---|---|
| Runtime CVEs | RELEASE BLOCKER | Node 24.22.1 in both Docker stages and running container | Release operator |
| Dependency denial of service | RELEASE BLOCKER | body-parser >=2.4.0; npm audit | Release operator |
| Persistence and rollback | DESIGNED | Same named volume; retain previous immutable image | Release operator |
| Credentials and data minimization | DESIGNED | No secrets in source/logs; synthetic identities only | Release operator |
| Privacy/legal scope | N/A | No new collection, provider or processing purpose | Owner |

Official sources: [Node advisory](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases), [24.22.1 release](https://nodejs.org/en/blog/release/v24.22.1), [body-parser advisory](https://github.com/advisories/GHSA-27r3-jxmh-p828).

## Layer 1.6 — AI Safety Posture

N/A: no AI runtime.

## Layer 2 — Methodology Banks

Read project AGENTS, README, WORKFLOW, PLAN-FORMAT, EXECUTION, Dockerfile, package manifests, existing pattern gate, toolchain and operations documentation. Rules honored: “Never skip hooks”, “Public Git history contains only original project artifacts”, “Do not use latest for release selection”. Canonical exemplars: existing Docker multi-stage build and scripts/check-patterns.mjs. Regression contract: a runtime/config consistency gate added to verify and exercised against the previous runtime. Verification uses the commands below and the existing realtime integration suites.

## Layer 3 — Command System

Phase A exact files: `.node-version`, `Dockerfile`, `package.json`, `package-lock.json`, `scripts/check-node-runtime.mjs` (NEW), `README.md`, `docs/toolchain.md`, `docs/operations.md`.

Pin 24.22.1, set a supported-major engine floor, update the vulnerable transitive lock and document the security baseline. Add the gate to verify. Gate: `npm ci && npm run verify && npm run check:i18n && npm run build && npm run check:bundle && npm audit`.

Phase B exact file: `docs/reviews/node-security-release.md` (NEW). Build an immutable release image, confirm readiness before replacement, deploy only poker with the existing volume, verify production Node and synthetic table flow. Roll back to the prior image if health or behavior fails. Gate: `npm run test:realtime && npm run test:ops` plus recorded container and public checks.

### Layer 3.1 — Dispatch Table

| Phase | Mode | Dependency | Owner | Files | Gate |
|---|---|---|---|---|---|
| A | Serial | P08 | Coordinator | Eight exact files above | Full clean-install/security/build gates |
| B | Serial | A | Coordinator | Release evidence above | Container health + public HTTPS/WSS smoke |

### Layer 3.2 — UI Flow Matrix

N/A: UI unchanged; existing PT/EN flows remain covered by verify and production smoke.

## Layer 4 — Patterns Reference

Require the supported Node24 security floor before running verification. Keep build/runtime versions equal. Preserve all existing hardening and isolated rollback selection.

## Layer 5 — Meta

No parallel edits within this repository. Other applications are audited in their own repositories/worktrees. Shared-host deployments are serialized. The host OS and third-party management services are separate operational surfaces; their actual results must be reported without claiming this application patch fixes them.
