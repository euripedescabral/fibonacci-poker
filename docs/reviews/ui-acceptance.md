# P01–P05 runtime and UI acceptance

Date: 2026-10-20. Environment: Node 24.18.0, SQLite native binding, Vite production build and Chromium through Playwright MCP. Only synthetic participants were used. No OVH deployment was performed.

## Executed evidence

| Area | Evidence | Result |
|---|---|---|
| Domain and storage | Fibonacci enum, mode/ties/zero/unknown, immutable revealed round, private projection, transaction rollback, actual read-only/write-lock failures, receipts/high-water replay, cookie hashing and one-use tickets | Pass |
| Realtime | Real SDK clients, hidden-state inspection, concurrent vote/clear, cold wake coalescing, admission bound, tab replacement, idle and empty-room disposal | Pass |
| Process crash | Separate process exits immediately after durable commit and before broadcast; rejoin restores value/sequence and does not replay completion | Pass |
| Browser collaboration | Separate EN/PT contexts create/join, vote/withdraw/reveal/clear, observer participation, shared suit, ties and only-unknown result | Pass |
| Reconnection | Browser reload and forced network loss preserve confirmed vote; offline controls disabled; new tab supersedes old | Pass |
| Privacy/XSS | Other participant's hidden value absent from roster DOM; script-shaped name displayed as literal text | Pass |
| Keyboard/reflow | Keyboard entry and Space vote; 14 Tab/Shift+Tab cycles remain in dialog, Escape restores opener; 720 CSS-pixel reflow passed (equivalent viewport coverage, not a physical browser zoom certification) | Pass |
| Preferences | PT/EN parity, manual override, blocked storage fallback, user and OS reduced motion, dialog Escape/focus return | Pass |
| Mobile capacity | 20 actual browser sessions; no horizontal overflow at 360×800, 390×844, 768×1024 or 1440×900 | Pass |
| Mobile interaction | Touch-emulated 390×844: entry with reduced 400px height, vote/reveal and settings; compact seats and fixed 5×2 hand; 568×320 landscape uses normal flow | Pass |
| Asset failure | Blocked main JS still leaves bilingual reload link; unblocking and reloading recovers application | Pass |
| Audio | Unit proof of gesture unlock refusal, one event per round, mute/no retrospective replay; no sound synthesized from recovered snapshots | Pass |

Source tests and [browser replay](../../tests/browser/scenarios.md) preserve the verification procedure. Synthetic screenshots were inspected locally and are not required public artifacts. Browser offline tests intentionally produce network errors; these are not claimed as a clean-online console pass.

## Integration review

Fixed during verification: transport's eager Express peer dependency; native-field schema patch tracking using the current schema factory; premature private sync before listener registration; Preact JSX configuration in DOM tests; singular result counts; explicit language label; bounded HTTP waits; initial asset-load fallback; synchronous modal opening and explicit boundary focus wrap. The mobile review replaced tall stacked seats with compact rows and kept voting controls visible without horizontal scrolling.

The public state contains only the explicit projection. The server commits before publishing, rejects stale rounds, and rechecks the active connection inside the queue. Shared preferences go through commands; personal preferences remain in browser storage. No paid services, analytics, AI calls, canvas engine or deployment scaffolding were added.

## Scope and remaining release work

P06 remains deferred and unauthorized. Production host/proxy verification, HTTPS, backup/restore, retention/deletion operations, deployment rollback, sustained load, final operator/privacy details and license decision are not completed by this milestone. Forwarded IP headers are deliberately ignored until the actual trusted proxy is inspected. Device checks use Chromium emulation; real Safari/Android smoke remains appropriate before the team launch.

## Final automated gates

`npm run verify`: 58 tests across 21 files, TypeScript, ESLint, source patterns and KERNEL structure pass. `npm run check:i18n`: 99 keys match. `npm run build`: production web/server succeed. `npm run check:bundle`: 92,253 gzip bytes against 204,800-byte budget. Late revealed-room joins and explicit outdated-client reload were also exercised in isolated browser contexts. Vite API/WebSocket proxy works with keyboard create/vote.

Final boundary regression: real SDK handshake with forged forwarded-IP headers preserves the socket IP after stripping untrusted headers before Colyseus authentication.
