# Plan workflow

Adapted from the workspace's existing RevendaFlash and agent-coord plan layouts: KERNEL layers, dispatch tables, phase gates and active/deferred/done lifecycle. No application-specific RBAC, billing or marketing rules are inherited.

## Lifecycle

- `active/`: wholly pending plans whose dependencies are satisfied. A plan being ready does not authorize implementation.
- `deferred/`: pending plans gated by predecessor completion; each records its exact activation condition.
- `done/`: completed historical plans, preserved rather than deleted.
- `_templates/`: reusable KERNEL skeletons.
- `README.md` is the execution index; `CHANGELOG.md` is append-only evidence.

P01 is the only executable starting plan once implementation is authorized. P02–P06 activate in order. After completion, move the plan to done, update references/index, append changelog and activate the next plan. Split partially completed scope before a multi-session handoff if it obscures remaining work. Never archive unfinished scope without a successor.

## Authoring and review

1. Read current code/history and contracts; future files must be explicitly marked NEW.
2. Fill Layers 1, 1.5, 2, 3, 3.1, 3.2 when UI is touched, 4 and 5; state Layer 1.6 N/A for this product.
3. Audit contracts across plans, security/privacy, failure behavior, file ownership and test coverage.
4. Every phase has a bounded exact file set (at most ten implementation files) and a gate. Plan/index/changelog updates are coordinator-owned bookkeeping.
5. A planned control is not a verified control. Use DESIGNED / RELEASE BLOCKER / N/A until code evidence exists; never declare security implemented during planning.
6. Review reports record concrete fixes, unresolved release facts and commands actually run.
7. Run `python3 scripts/check-plans.py`; inspect `git status --short` and `git diff` before commit.

## Git and worktree lifecycle

Create a task worktree from current main under the workspace-managed root; run the workspace lifecycle begin before editing and finish after reconciliation. Check peers and preserve unrelated work. Work serially unless a future dispatch explicitly proves safe disjoint ownership. Commit explicit files only. Fast-forward main, execute pre-push checks, push only the project allowlist. After merge fetch origin/main and run the workspace merged-worktree cleanup. Keep and report worktrees that are dirty, unmerged, locked or not confirmed on origin/main.

Public Git history contains only original project artifacts. Never copy local brain documents, even sanitized versions. Workflow names can be referenced without embedding private source material.
