# Security, privacy and release boundaries

Runtime controls are implemented and tested as recorded in the completed plans and [P06 release evidence](reviews/release-evidence.md). Public source and OVH deployment are explicitly authorized; actual provider configuration and release verification remain gates. A table link is an unlisted capability: anyone receiving it may enter and reveal/clear. There is no host, account, secret password or granular ACL in MVP. Communicate this on the join screen; do not market tables as protected from link recipients.

## Controls assigned to plans

| Boundary | Designed control | Plan / required proof |
|---|---|---|
| Browser → session | Host-only HttpOnly Secure SameSite cookie; no storage of raw identity in JS | P03 cookie tests, P04 origin tests |
| HTTP / WebSocket | Same-origin allowlist, JSON content type, strict schemas, handshake ticket, command membership checks | P04 forged-origin and cross-room tests |
| Vote visibility | Separate private state; public projection allowlist; no raw state serialization | P02 projection + P04 two-client frame inspection |
| Replay / races | Per-table serialized mutations, roundId, commandId and per-member sequence high-water, transactional receipts | P02/P03/P04 concurrent and crash gates |
| Abuse | 4 KiB frame; connection/creation/command limits; no public room directory | P04 limits and P06 host calibration |
| UI injection | Render names as plain text, no HTML injection; CSP self-hosted assets; safe external links | P05 hostile-name and CSP checks |
| Storage | Dedicated unprivileged volume, WAL FULL, backup integrity, file access restricted to service user | P03/P06 restore and permissions checks |
| Observability | Redact cookies, tickets, room capability URLs, names and votes; counts/error codes only | P04 log-capture gate |
| Supply chain | Exact lockfile, dependency license/security review, immutable release image | P01/P06 dependency audit |

Starting abuse defaults, configurable after team testing: 10 table creations/hour/identity and 60/hour/IP, 60 joins/min/IP (NAT-friendly), 10 mutations/sec/member burst 20, 10 failed tickets/min/IP, maximum 20 active connections/table, 20 active tables/process and queue length 128/table. Avoid permanently banning a shared office NAT. Response is retryable 429 with retry delay. Rate-limit state is process-local because deployment is a single process; restart does not preserve abuse counters. No unbounded payloads or user file uploads.

## Data inventory and retention

- Collect display name, opaque identity, current votes, mode/suit, membership and activity timestamps. No email, payment, tracking SDK or analytics.
- Identity cookie lifetime 365 days rolling. Old identity/membership rows expire after 365 days inactivity; table ID/settings persist. Current-round vote/result references must be redacted or removed when deleting identity, so expired names are not retained by a JSON snapshot.
- Clear deletes previous votes/result; idempotency metadata is bounded by protocol high-water marks. No completed-round history.
- Operational logs: 7 days; consistent encrypted database backups: daily, last 7 days. Backups must be outside the app volume and an approved off-host destination before general launch; same-host copies alone do not protect host loss.
- P06 provides local operator export/delete by opaque identity/table ID with a verification procedure (proof of current session when available). No unauthenticated delete endpoint. Deletion redacts names/votes from snapshots and schedules expiration from backup retention; restore replays a separate restricted deletion ledger before reopening service.
- Browser “forget me” is not a substitute for server deletion; deletion is an owner-operated process initially. Explain limits and contact route in bilingual notice. Loss of cookie requires an owner-reviewed request, not impersonation by display name.

## Legal/privacy review scope

The initial product is a tool for an adult work team; no real gambling, payment, prize, child-specific service or AI processing. Original suit artwork, dependencies' licenses and a repository license decision must be checked. Public GitHub does not imply a chosen open-source license.

Before production release, the owner must supply the public domain, operator/contact identity, actual OVH region, intended sharing audience, processing basis and provider/transfer terms applicable to that deployment. Implement a concise PT/EN privacy/use notice describing names/votes, link access, essential storage, retention and deletion contact. Do not claim blanket LGPD/GDPR compliance from technical checks. No statutory incident deadline is frozen here; operator runbook points to current official guidance and records an incident contact.

These are release blockers, not blockers to writing local code. There is no stakeholder acceptance of unresolved legal risks in this plan package. Accessibility engineering targets WCAG 2.2 AA relevant to these flows; keyboard/motion/audio alternatives are tested regardless of any specific legal obligation.

## Operational fact reconciliation

OVH resources, Docker/Traefik versions and the isolated network/proxy strategy have been inspected; see [OVH preflight](reviews/ovh-preflight.md). Domain/provider authentication, actual hosting region and an approved verified off-host destination remain unresolved. Deployment authority is already granted. No guessed Traefik labels, shared volume edits or other-project restarts are permitted.
