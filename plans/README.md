# Implementation plan index

**P01–P05 implementation authorized and in progress. P06 remains excluded.** All runtime commands and outputs below belong to future execution. Initial usage: one Scrum team, modest load.

| Order | Plan | Status | Activation |
|---|---|---|---|
| P01 | [Foundation and executable gates](done/p01-foundation-and-contracts.md) | Complete | Explicit implementation request |
| P02 | [Round rules and private/public protocol](done/p02-round-domain-and-protocol.md) | Complete | P01 |
| P03 | [Durable tables, identity and atomic mutations](active/p03-durable-storage-and-identity.md) | In progress | P02 |
| P04 | [Shared rooms, presence and recovery](deferred/p04-realtime-rooms-and-reconnection.md) | Deferred by dependency | P03 |
| P05 | [Poker table UI, localization and preferences](deferred/p05-table-ui-and-accessibility.md) | Deferred by dependency | P04 |
| P06 | [Team launch, OVH isolation and recovery](deferred/p06-ovh-release-and-recovery.md) | Deferred by dependency | P05 |

This index is the master coordinator; six KERNEL execution plans own the implementation. It is not a seventh overlapping plan. Execution is serial: P01 → P02 → P03 → P04 → P05 → P06.

- [Product requirements](../docs/product.md)
- [Module architecture](../docs/architecture.md)
- [Protocol and data model](../docs/protocol.md)
- [UI flow matrix](../docs/ui.md)
- [Acceptance matrix](../docs/acceptance.md)
- [Security / deployment blockers](../docs/security.md)
- [Plan review and gap analysis](../docs/reviews/plan-review.md)
- [Workflow](WORKFLOW.md), [format](PLAN-FORMAT.md), [execution](EXECUTION.md)

See lifecycle status above for the active plan. Dependent plans move from deferred to active after predecessor completion; update links and manifest together. Completed plans are archived only after their gates pass.

## Release-only unresolved facts

P06 must inspect OVH resources/proxy/ports; obtain domain, operator contact, actual region, approved backup destination, license decision and release authorization. These facts do not block local implementation P01–P05. The plans never substitute guessed live configuration.
