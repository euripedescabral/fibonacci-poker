# Plan review and gap analysis — 2026-10-20

Decision: **ready for local implementation after an explicit implementation request**. Public repository publication is authorized. Live release remains gated by P06 environment/privacy/license facts and actual runtime evidence. No application code exists.

Review methods applied: plan-audit-and-refinement, plan-security-scan, plan-legal-review, systemic-functionality-audit, semantic-change-propagation-audit and test-strategy-and-regression-gates. Those prompts were consulted locally, not copied here. This is the original project-specific result.

## Findings and corrections

| Severity | Gap found | Correction / required proof |
|---|---|---|
| P1 | Typecheck preceded package creation | P01-A checks compiler; B creates/typechecks packages; C establishes verify. |
| P1 | SDK tests depended on a later harness | Moved harness to P04-A and updated closed file inventory. |
| P1 | Transient room ID could invalidate saved link | Stable tableId + one wake-up promise + durable load; T01/T11. |
| P1 | Duplicate clear could erase a new round | roundId plus transactional replay; T04/T23. |
| P1 | Receipt pruning could permit replay | Sequence high-water rejects pruned duplicates and requires resync; T23. |
| P1 | Crash after commit/before send unspecified | Persist before publish; retry/restoration returns committed result; T12. |
| P1 | Empty or observer-only table could complete | Require at least one active voter and once-per-round marker; T07/T08. |
| P1 | Disconnection/mode switch could rewrite revealed results | Frozen snapshot; open observer withdraws, disconnected submitted vote retained; T06/T07. |
| P1 | Permanent tables implied indefinite personal data | Separate durable link/settings from expiring identity/membership, snapshot redaction and backups; T22. |
| P1 | Name was insufficient for identity recovery | Private cookie, hash at rest and one-use ticket; T14. |
| P1 | Reconnect/cold joins could exceed 20 seats | Atomic admission and replacement generation; T01/T16. |
| P1 | Shared host/proxy assumptions unsafe | Read-only OVH inventory; bounded queue/rooms, exact trusted proxy; T18/T21. |
| P2 | Old app could endlessly reconnect after deploy | Protocol version, Reload UI and cache policy; T24. |
| P2 | Exactly-once audio would overclaim reliability | Best-effort event, persistent marker, client dedup and gesture; T08. |
| P2 | Ping/pong could prevent idle suspension | Separate activity from liveness; no resume from focus alone; T15. |
| P2 | Clipboard, Unicode, storage-blocked and error states omitted | Added explicit matrix fallbacks and T17/T21/T24. |
| P2 | Generic game stack could overcomplicate team launch | Single process, SQLite and SVG/CSS; no cluster/Redis/canvas/SSR. |
| P1 | Privacy notice was a document without an app route | P05 adds /privacy; P06-C wires verified public facts and bilingual tests. |
| P2 | Prose mixed into shell gates was not executable | Separated actual commands from mandatory MCP/manual release evidence. |
| P2 | Public upload could include local artifacts | Ignore .archify; original portable docs; inspect staged/outgoing history. |

## Workflow coverage

| Workflow | Entry → control → state → outcome | Evidence planned |
|---|---|---|
| Create/join | Cookie → origin/schema/capacity → table/member → join ticket | P03/P04; T01/T14/T16 |
| Vote/reveal/clear | Membership → round/sequence → transaction → sanitized patch | P02–P04; T02–T07/T12/T23 |
| Presence/idle | Activity/disconnect → active voters → completion marker → event | P04/P05; T07/T08/T15 |
| Restore | Cookie/link → authentication → snapshot → own vote/public state | P03–P05; T11/T16 |
| Settings | Local vs shared control → appropriate persistence → accessible UI | P05; T09/T10/T17 |
| Deploy/recover | Approved config → backup/migrate/ready → smoke/rollback | P06; T18–T20/T22 |

## Cross-layer and semantic audit

- All R01–R18 map to T01–T24 and owning plans. Six execution plans, serial dependencies, exact inventories, ≤10 implementation files per phase.
- Future targets are NEW; P02 indexes explicitly depend on P01. No invented canonical code exemplars.
- Security/privacy controls are DESIGNED/unverified. Layer 1.6 N/A because product has no AI runtime.
- No task/item entry, median or no-observer rule remains normative. Earlier local diagrams are historical and excluded from public source.
- Vite builds, Preact renders; Colyseus room state is not durable storage. Database recovery remains application responsibility.
- All connected members reveal/clear/set suit; only active voters vote. No implicit host role.
- Checker proves document structure/links/reference coverage, not runtime behavior. Browser product tests are still required.

## Remaining release facts

| Item | Owner / point | Scope blocked |
|---|---|---|
| Domain, actual proxy/resources/networks/container manager | Owner/executor, P06 read-only preflight | Live deployment |
| Off-host encrypted backup destination and restore | Owner/executor, P06 | Release recovery |
| Operator contact, actual region, privacy/provider terms | Owner, P06-C | Production use notice |
| License choice and dependency attribution | Owner, P06-C | Licensed release; none implied by public source |
| Exact compatible pinned versions/native SQLite | Executor, P01-C | Subsequent implementation |
| Runtime tests/browser flow/restore measurements | Executor, each plan | Feature acceptance |

Initial load is one Scrum team. Five tables of synthetic clients provide modest headroom; results calibrate container limits without speculative scaling.

## Verification status

Documentation checker is run before commit and actual result recorded in CHANGELOG. Runtime, product browser tests, deployment and restore: **NOT RUN — application not implemented**. OVH was not contacted or modified.

## Implementation follow-up

The verdict and NOT RUN statements above record the original planning review. P01–P05 were subsequently implemented under explicit owner authorization. See completed plans and [UI/runtime acceptance](ui-acceptance.md) for current evidence. P06 release blockers remain unresolved.
