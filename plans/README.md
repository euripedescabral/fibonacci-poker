# Implementation plan index

**P01–P06 complete. Fibotable is live at https://fibotable.com.** Runtime evidence is recorded in each completed plan and the UI acceptance report. Initial usage: one Scrum team, modest load.

| Order | Plan | Status | Activation |
|---|---|---|---|
| P01 | [Foundation and executable gates](done/p01-foundation-and-contracts.md) | Complete | Explicit implementation request |
| P02 | [Round rules and private/public protocol](done/p02-round-domain-and-protocol.md) | Complete | P01 |
| P03 | [Durable tables, identity and atomic mutations](done/p03-durable-storage-and-identity.md) | Complete | P02 |
| P04 | [Shared rooms, presence and recovery](done/p04-realtime-rooms-and-reconnection.md) | Complete | P03 |
| P05 | [Poker table UI, localization and preferences](done/p05-table-ui-and-accessibility.md) | Complete | P04 |
| P06 | [Team launch, OVH isolation and recovery](done/p06-ovh-release-and-recovery.md) | Complete | P05 + owner release scope |

This index is the master coordinator; KERNEL execution plans own the implementation. Execution is serial: P01 → P02 → P03 → P04 → P05 → P06.

- [Product requirements](../docs/product.md)
- [Module architecture](../docs/architecture.md)
- [Protocol and data model](../docs/protocol.md)
- [UI flow matrix](../docs/ui.md)
- [Acceptance matrix](../docs/acceptance.md)
- [Security / deployment blockers](../docs/security.md)
- [Plan review and gap analysis](../docs/reviews/plan-review.md)
- [Workflow](WORKFLOW.md), [format](PLAN-FORMAT.md), [execution](EXECUTION.md)

See lifecycle status above for the active plan. Dependent plans move from deferred to active after predecessor completion; update links and manifest together. Completed plans are archived only after their gates pass.

## Operations follow-up

DNS/TLS, hosting region, encrypted private R2 recovery, daily backup job and public smoke are verified in [launch evidence](../docs/reviews/launch-evidence.md). The existing shared OVH host OS is end-of-life and requires separate maintenance. Monitoring is owner-operated; no automatic paging is configured. Physical-device/screen-reader testing remains unverified.

## Frontend follow-up

[P07 — Loading and motion](done/p07-loading-and-motion.md) is implemented and deployed. See the [audit and verification limits](../docs/reviews/loading-motion-audit.md).

[P08 — Editable revealed votes](done/p08-editable-revealed-votes.md): deployed and verified at https://fibotable.com on 2026-10-23.

[P09 — Node security release](active/p09-node-security-release.md): patch and production validation in progress.
