# Verified toolchain

Node 24.18.0. npm lockfile pins all transitive versions.

| Package | Version |
|---|---|
| @colyseus/core | 0.18.19 |
| @colyseus/schema | 5.0.41 |
| @colyseus/sdk | 0.18.5 |
| @colyseus/ws-transport | 0.18.4 |
| better-sqlite3 | 13.0.3 |
| cookie | 2.0.1 |
| preact | 11.0.1 |
| zod | 4.6.7 |
| @preact/preset-vite | 2.10.6 |
| @testing-library/preact | 3.2.4 |
| @types/better-sqlite3 | 9.6.0 |
| @types/node | 26.6.5 |
| esbuild | 0.28.2 |
| eslint | 10.13.0 |
| jsdom | 30.1.3 |
| tsx | 4.23.15 |
| typescript | 6.0.3 |
| typescript-eslint | 8.72.0 |
| vite | 8.3.4 |
| vitest | 5.0.5 |

P01 evidence: npm ci, typecheck, lint and 3 foundation tests passed. Tests open native SQLite/WAL on disk, load SDK exports and build a real Preact TSX fixture. npm audit reported zero vulnerabilities. TypeScript 7 was incompatible with current typescript-eslint; selected TypeScript 6. No validation disabled.

Runtime scopes are added in later plans. Missing future focused suites intentionally fail. P06 operations/load suites are not implemented by P01–P05.

P04 runtime verification: `@colyseus/ws-transport` imports its Express peer eagerly. Express is pinned as a transport dependency; application routing still uses Node HTTP. Public Colyseus matchmaking handlers are removed after boot; only the capability-scoped application routes admit sessions. Current schema factory API is used to preserve patch tracking with native class fields.
