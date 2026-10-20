# Acceptance matrix

This matrix was authored before implementation. P01–P05 now have runtime evidence in done plans and the [UI acceptance report](reviews/ui-acceptance.md). P06 backup/deletion/recovery tests and additional concurrency/idle scenarios now have [release evidence](reviews/release-evidence.md); load-soak completion and public production acceptance remain separately tracked. Coverage IDs remain stable.

| Test | Requirements | Scenario and expected proof | Owner |
|---|---|---|---|
| T01 | R01 R02 | Create/join by link; unknown link 404; 20 slots; simultaneous 21st denied; one table cannot read another | P04 |
| T02 | R03 R04 | Each allowed value accepted, invalid/oversized payload rejected; choose/change/withdraw | P02 |
| T03 | R04 | Two real SDK clients: observer/other voter never receives hidden values in frames; own value privately restored | P04 |
| T04 | R05 R07 | Voter and observer reveal/clear; double concurrent clear creates one round; delayed prior-round action rejected | P04 |
| T05 | R06 | Mode of [3,5,5,8]=5; [3,3,5,5] ties; all distinct ties; zero valid; only ? no numeric result | P02 |
| T06 | R08 R09 | Late join open/revealed; observer toggle withdraws only while open; revealed snapshot immutable | P02 P04 |
| T07 | R10 R11 | Disconnect/idle unvoted member may complete remaining voters; no completion with zero voters; marker once/round | P02 P04 |
| T08 | R11 | Audio after gesture only, mute, event dedup, no sound on snapshot restore; autoplay refusal harmless | P05 |
| T09 | R12 R18 | Original SVG suits; shared setting updates all clients; values unchanged | P05 |
| T10 | R13 R14 | PT/en/fallback/manual override, dictionary parity, errors/aria translated, system + user reduced motion | P05 |
| T11 | R15 | All disconnect → room disposed → same link rehydrates; process restart restores current round, own vote and names | P03 P04 |
| T12 | R15 | Kill before commit → no acknowledged mutation; after commit/before send → retry/resync returns committed result once | P03 P04 |
| T13 | R15 | SQLite busy/full/write error leaves published state unchanged; rollback and health recovery tested on temporary DB | P03 P04 |
| T14 | R15 | Bad cookie, forged identity/ticket, expired/reused ticket, unknown origin and cross-room command rejected | P03 P04 |
| T15 | R16 | Fake clock reaches 15 min despite ping/state traffic; no auto-resume on focus; genuine interaction reconnects | P04 P05 |
| T16 | R02 R15 | New tab replaces old; stale socket denied; reconnect at full capacity shows retry; no 21st connection | P04 |
| T17 | R18 | Keyboard, 200% zoom, 360/768/1440 widths, 20 names, mobile touch, disabled states and dialog focus | P05 |
| T18 | R17 | 5×20 clients, 30 min, p95 ≤200 ms excluding external network, no lost ACKs; idle disposal memory plateau | P06 |
| T19 | R15 R17 | Online consistent backup → separate database restore → same link/round; integrity_check; failed migration blocks ready | P06 |
| T20 | R17 | Isolated container, HTTPS/WSS, CSP, health, graceful SIGTERM, previous image rollback without erasing data | P06 |
| T21 | R01 R15 | Name XSS/control/Unicode/duplicate handling; no tokens/votes/names in logs, body limits and NAT-friendly limits, queue/active-table limits, trusted proxy IP | P04 P05 |
| T22 | R15 | Export/delete + snapshot redaction + restore deletion ledger; current vote removed without corrupting other members | P06 |
| T23 | R04 R07 | Vote vs reveal queue ordering; repeat command changes payload rejected; pruned receipt doesn't reapply sequence | P02 P03 P04 |
| T24 | R05 R07 | Storage failure UI keeps confirmed state; disconnect pending command reconciles rather than voting in new round; protocol mismatch/reload and static chunk failure | P05 |

## Evidence format

Record exact commit, commands, environment versions, fixture counts, elapsed time and pass/fail in release evidence. Never store screenshots containing real team votes/names in the public repository. Use synthetic participants. Runtime harnesses must assert behavior, not only exit code; no skipping failing scenarios to pass a gate.

Browser steps are authored in `tests/browser/scenarios.md` and executed with Playwright MCP. Use isolated contexts/profile leases; if no browser context is available, report blocked rather than substitute custom CDP/scripts. SDK-only load/concurrency tests run from the terminal and do not navigate a browser.
