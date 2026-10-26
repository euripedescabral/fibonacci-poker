# Node security release — 2026-10-26

Source: `85e4255`. Production: https://fibotable.com. [CI 40268896727](https://github.com/euripedescabral/fibonacci-poker/actions/runs/40268896727) passed for that exact revision.

## Fixed

- Node 24.18.0 → 24.22.1 in local tooling, engine constraint and both Docker stages. This applies the October 21 security release covering DNS, TLS, Brotli, HTTP agent, snapshot entropy and filesystem permission checks. See the [official advisory](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).
- Locked body-parser 2.3.0 → 2.4.0, fixing [CVE-2026-111181](https://github.com/advisories/GHSA-27r3-jxmh-p828).
- Verification rejects older Node processes and inconsistent local/Docker versions. Negative check with the previous 24.18.0 executable failed as expected.

## Validation

Clean npm install, typecheck, lint, 92 tests across 26 files, plan structure, 106 locale keys, production build and bundle gate passed. npm audit returned zero advisories, including development dependencies. Local production HTTP smoke verified readiness, homepage, privacy, session creation and table creation.

Linux production image built successfully with release notice enabled. A temporary isolated candidate passed health/homepage/core runtime checks before replacement. Running image: `fibotable:85e4255-security`, immutable ID `sha256:48c29ba5073870ed13678de9a6e19054e4f5fcf2bfc9a0f39fbc5b9f152e52db`. Actual in-container Node: `v24.22.1`; health: healthy. Public readiness and privacy return 200.

Playwright MCP verified a synthetic table created before deployment retained its identity, table and revealed vote across replacement. After deployment it verified editing the revealed vote, recomputing the mode, hiding, revealing and starting a new round. Console: zero errors or warnings. No horizontal overflow in the tested desktop viewport. This is not new physical-device or screen-reader certification.

## Operations

The named data volume, credentials, proxy and sibling containers were preserved. Deployment used the maintenance lock and updated the persisted image selection. Previous rollback image remains `fibotable:273e9c6-release`. The temporary candidate was stopped and removed. No database schema change occurred.

The shared host still runs end-of-life Ubuntu 25.04 and requires a separately rehearsed OS migration. This application release does not resolve that host finding. Broader Node/security maintenance for other applications is tracked with their own release evidence.
