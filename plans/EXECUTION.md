# Execution contract

Plan creation alone does not authorize implementation. The owner authorized P01–P05 and subsequently requested P06 execution and public deployment. On execution: read the index, product/protocol contracts, select the active plan, reconcile commits and changelog, establish a worktree and run baseline gates.

Default is **one agent, serial plans P01 → P02 → P03 → P04 → P05 → P06**. There is no safe parallel batch defined now: contracts, lockfile and integration dependencies are shared. Do not invent parallel dispatch from an opportunity to save time.

An executor must report files read, constraints honored, files changed, commands and actual results, outstanding blockers and exact worktree path. After each phase run its gate; after a plan run `npm run verify` plus that plan's focused gates. The foundation cannot claim unavailable future suites pass; verify runs only existing suites but fails when any present suite is empty unexpectedly.

Use Playwright MCP for interactive browser work and record a replayable Markdown scenario/evidence, not inline browser drivers. Server integration/load/crash tests use Node/Vitest and the real Colyseus SDK, not browser automation. The owner explicitly authorized live OVH release; provider authentication and actual release gates remain required.

Coordinator owns plan moves, index/changelog, shared manifests and final integration. Changes outside a phase's closed set require a plan amendment with rationale and revised gate before editing.
