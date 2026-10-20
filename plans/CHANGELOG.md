# Plan changelog

## 2026-10-20

- Created original project KERNEL planning package: six serial execution plans, active P01 and dependency-deferred P02–P06.
- Consolidated agreed product scope and engineering defaults into docs; no application code, runtime install or deployment.
- Added exact future-file inventories, phase gates, UI matrix, security/privacy release blockers and acceptance matrix.
- Public repository publication authorized for euripedescabral/fibonacci-poker only; no private workspace material in source/history.

- Applied plan, security/privacy, systemic, semantic and test-strategy reviews; findings and corrections recorded in docs/reviews/plan-review.md.
- Documentation gate passed: six KERNEL plans, 22 Markdown files, local links/dependencies/phase inventories and R01–R18/T01–T24 coverage references checked. Runtime tests not run (application intentionally not implemented).

- P01 completed: npm ci, TypeScript 6 typecheck, ESLint, native SQLite + Preact build smoke and 3 foundation tests passed; npm audit: zero vulnerabilities. No product behavior claimed by foundation tests.

- P02 completed: Typecheck, lint, 21 domain tests and full verify (24 tests) passed. Open-state projection secrecy, mode/ties, observer reveal, stale clear and completion edge cases covered.

- P03 completed: 33 tests passed; transactional rollback, SQLite write failure and lock contention, cookie identity, receipt replay and disk recovery verified.

- P04 completed: 44 tests passed including real SDK hidden-state inspection, simultaneous votes and clears, reservations, tab replacement, idle suspension, runtime eviction and isolated process crash after commit before broadcast. HTTP origin/body/session and private-only matchmaking verified.

- P05 completed: 57 tests pass across 21 files; typecheck/lint/source gates pass; 99 locale keys match; production build passes; JS gzip 92253 bytes under 204800. Playwright MCP verified isolated real users, mobile touch and 20 seats at 360/390/768/1440 widths, short landscape, keyboard focus, hidden cards, mode/ties, observer actions, network/reload recovery, tab replacement, blocked storage, OS reduced motion and missing-bundle reload. P06 remains deferred and excluded.

- P01–P05 final integration: 58 tests pass after adding WebSocket forwarded-header regression. P06 stays deferred.

- P06 activated after the owner's explicit deployment/execution request. Added isolated container configuration, authenticated SQLite backup/restore, deletion replay/expiry, S3 off-host adapter, bilingual release notice and dependency notices. Local verification now passes 70 tests; real OVH synthetic recovery/rollback/restore passes. Measured 1-CPU calibration failed p95 at 362.9 ms; reduced redundant per-vote snapshots and started a fresh 30-minute soak. Public DNS/provider access, off-host job/key escrow and hosting-region facts remain unresolved, so P06 stays active and no public launch is claimed.
