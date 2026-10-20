# Fibonacci Poker

Planning poker with persistent shared tables, Fibonacci cards and fictional suits. Participants vote privately, reveal together and see the **mode: the most frequent value**, including ties.

**Status: planning only. No application, installed dependencies or deployed service yet.** Initial audience is one Scrum team; production will use the owner's existing OVH instance.

## Start here

- [Plan index and execution order](plans/README.md)
- [Product contract](docs/product.md)
- [Architecture and module boundaries](docs/architecture.md)
- [Protocol and persistence contract](docs/protocol.md)
- [UI flows and localization](docs/ui.md)
- [Security and release boundaries](docs/security.md)
- [Acceptance and failure scenarios](docs/acceptance.md)
- [Plan review](docs/reviews/plan-review.md)

Proposed implementation baseline: **Vite + Preact + TypeScript**, **Node.js + Colyseus**, **SQLite WAL**, Docker on OVH. Vite is the build tool; Preact renders the UI; Colyseus provides room transport/state synchronization. Cards use SVG/CSS, without a canvas game engine.

## Validate the planning package

```sh
python3 scripts/check-plans.py
```

This checks documentation structure, links, phase ownership and required KERNEL sections. Runtime commands do not exist until P01 establishes them. Do not mistake a documentation pass for implemented features or a deployment pass.

## Contribution and publication

This is a personal public project. Use `AGENTS.md` and the KERNEL workflow. Public visibility does not itself grant a software license: license selection must be confirmed with the owner before distributing application releases or incorporating code with incompatible terms. No license grant is implied by this README.
