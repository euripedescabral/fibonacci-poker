# KERNEL format

All implementation plans must have YAML metadata: id, name, status, dependencies, activation, priority, effort.

## Required layers

- **Layer 1 — Core Configuration**: context grounded in current state, objective, constraints, measurable success and exclusions.
- **Layer 1.5 — Security + Legal Posture**: relevant threat/control, current design status, exact evidence or future gate and accountable release owner. No blanket pass; no invented acceptance of risks.
- **Layer 1.6 — AI Safety Posture**: N/A here; introduce a full review only if AI runtime enters scope.
- **Layer 2 — Methodology Banks**: exact domain contracts and pitfalls, referencing project docs instead of duplicating them.
- **Layer 3 — Command System**: ordered phases; file → change table, NEW labels and runnable gate after the prerequisite script exists. At most ten implementation files per phase.
- **Layer 3.1 — Dispatch Table**: phase, serial/parallel mode, dependencies, owner, files and gate. One worktree per agent.
- **Layer 3.2 — UI Flow Matrix**: each UI mutation/transition, pending PT/EN, success, error, role, theme and keyboard. May reference the complete matrix in `docs/ui.md`; no page-only summaries.
- **Layer 4 — Patterns Reference**: actionable patterns/contracts; pseudocode is not application code.
- **Layer 5 — Meta**: resolved decisions, blast radius, append-only findings and cold-start continuity.

## Greenfield gates

P01 creates the runtime command contract. Later plans may specify those commands only with P01 as a dependency. No `--passWithNoTests`, empty test glob, placeholder exit-zero script or skipped assertion can count as passing. Current planning gate is Python standard-library only.

## Audit criteria

Check consistency, requirements traceability, future vs existing paths, replay/race behavior, privacy boundary, keyboard/mobile/locales, deployment isolation, rollback and cleanup. Review design feasibility separately from runtime correctness. Release facts unavailable locally remain explicit P06 blockers, not guessed values.
