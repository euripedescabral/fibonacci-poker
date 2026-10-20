# Product contract

Status: agreed product scope plus explicit engineering defaults chosen for executable plans, 2026-10-20. No app is implemented. Initial sharing is with the owner's Scrum team, not a high-volume service.

## Agreed requirements

| ID | Requirement |
|---|---|
| R01 | Create a table and share a reusable link; join with a display name, no account/signup. |
| R02 | At most 20 connected people per table, voters and observers combined. |
| R03 | Fibonacci deck: 0, 1, 2, 3, 5, 8, 13, 21, 34 and ?. No item/task definition step. |
| R04 | Votes hidden until reveal; changing or withdrawing a vote is allowed while open. |
| R05 | Every connected member, including observers, can reveal or clear; no host role. |
| R06 | Reveal each submitted card alongside its author; result is MODE, including all ties. |
| R07 | Clear starts a new round without removing members or settings. |
| R08 | Join and vote during an open round; join after reveal and wait for the next round to vote. |
| R09 | Observers are visible separately; switching to observer withdraws a vote during an open round. |
| R10 | Disconnected/inactive people do not block completion. |
| R11 | One subtle sound when all active connected voters have chosen, once per round; reveal remains manual. |
| R12 | Configurable fictional suits, with original artwork; suits have no scoring meaning. |
| R13 | Personal sound setting and Reduce motion setting; system motion preference respected. |
| R14 | Portuguese and English by browser locale, manual override, English fallback. |
| R15 | Persist tables, current round and identity; restore on reconnect/restart; reusable links even when everyone leaves. |
| R16 | Suspend connections after 15 minutes without interaction; resume on interaction. |
| R17 | Existing OVH instance; light initial use; no heavy/distributed infrastructure. |
| R18 | Responsive poker table, card entry/flip animations, keyboard access and animation-free alternative. |

## Defaults resolved for implementation

- Name: trim and normalize NFC, 1–32 Unicode code points, reject control characters. Render as plain text; duplicate names allowed, shown with stable short participant suffix when needed.
- Table route `/t/{tableId}`; default localized title (no title form). tableId is an opaque random capability (at least 128 bits of entropy), never a sequential ID or public directory entry.
- Default entrant is a voter. Observing is a simple toggle, not a separate login flow. Both modes can reveal, clear and update suit settings.
- Only connected, non-idle voters count in the completion denominator. `?` counts as a chosen card for completion but is excluded from numerical mode.
- Stored votes from disconnected voters still appear at reveal with an offline badge. They do not block completion. This preserves votes on transient failures. An open-round switch to observer removes that person's vote.
- At reveal, freeze names, votes, modes of submitted voters and result. Later name/mode changes affect presence/next round, never rewrite the result. Users without cards show “No vote / Sem voto”, not zero.
- All distinct numeric values with equal frequency: display an explicit tie with all values and counts. No numeric votes: “No numeric votes / Sem votos numéricos”. Never round or select a winner arbitrarily.
- Reveal can happen before all vote. Show pending count but do not add a confirmation dialog. Reveal with no submitted cards is disabled in UI and rejected by server.
- Clear is immediate in either phase, even if no cards exist; creates a fresh round ID. Stale clears must never clear the next round. A brief disabled/pending button prevents double submit; server enforcement remains authoritative.
- A person joining a revealed round starts as voter but has no editable card. Mode switching after reveal is allowed and changes next-round participation only.
- If the final unvoted voter disconnects or becomes observer and remaining voters all voted, completion may fire. Zero voters never completes. Once fired, changes never fire it again that round.
- One active connection per identity per table: a new tab replaces the old connection with a translated message; it must not consume two seats. A returning identity is still subject to 20 active connections; persisted seats are not permanent capacity reservations.
- Connection restored by private browser identity, not by display name. Cookie deletion/another browser creates a new identity. No cross-device account recovery in MVP.
- Default suit family is original “Brasa”; selectable fictional families Brasa, Garra, Órbita, Coroa partida. Shared setting changes all card decoration, not value. Final vectors are produced in P05; no third-party game assets.
- Default sound on, armed only after a user gesture; no attempt to bypass autoplay restrictions. Sound and motion preferences are per browser, not broadcast.
- Motion setting defaults to system preference. Effective reduced motion = system preference OR user's explicit reduction, so an OS reduction cannot be overridden by app animations.
- Browser locale starting with `pt` maps to Portuguese; `en` and others map to English. Language override persisted locally. Numbers and counts use the selected locale.

## Retention boundary

Table link and table settings do not expire automatically. Only the current round is retained; clear removes prior votes/result/name snapshots and processed-command records for that old round. Membership records are retained to restore identities (bounded cleanup is specified in security docs). Persistent does not mean disconnected personal data must live forever. Product has no history UI, tracker, timers visible to users, chat, money, betting, analytics, AI or email.
