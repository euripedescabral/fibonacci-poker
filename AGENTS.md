# Fibonacci Poker — project contract

Read `README.md`, `plans/WORKFLOW.md`, `plans/PLAN-FORMAT.md`, `plans/EXECUTION.md` and the selected plan before editing. Product and engineering contracts in `docs/` are authoritative; old local diagrams are exploratory snapshots.

- Current authorization: implement P01–P05 and publish the project. P06 and live OVH release remain outside scope.
- Initial audience: the owner's Scrum team, light usage. One backend process on the existing OVH instance.
- KERNEL plans; backend contracts before UI integration; no speculative distributed infrastructure.
- Non-trivial changes use one linked worktree per active agent. Follow workspace lifecycle begin/finish; no stash switching.
- Solo project: conventional commits and fast-forward main, no PR requirement. Never skip hooks, force main, amend pushed commits or stage all files.
- Browser navigation/testing uses Playwright MCP. Open user-facing artifacts in Arc. No AppleScript or custom browser drivers.
- Public upload allowlist: this application repository only. Never include brain material, copied vault prompts, secrets, session receipts, absolute user paths or browser auth state in files or Git history.
- `.archify/` is local-only evidence. Do not upload it by changing ignores. Use portable project docs for public architecture context.
- Runtime checks listed in plans are future deliverables, not existing passing checks. `python3 scripts/check-plans.py` is the current documentation gate.
- Version pins are recorded during P01 after compatibility checks; commit the npm lockfile. Do not assume an untested framework API exists.
- Scope: English and Portuguese, fictional suits, Fibonacci, mode (not median), persistent tables, 20 active connections including observers, reconnect, 15-minute idle, sound once per round and reduced motion.
