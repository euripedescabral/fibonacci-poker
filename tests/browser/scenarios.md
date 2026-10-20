# Browser acceptance replay

Use Playwright MCP against the built local server. Use synthetic names and separate browser contexts for different identities; a second page in the same context tests replacement. Never copy authentication state or real team data into the repository.

1. Open home in English. Enter a name, create a table, copy its URL. Join that URL in a Portuguese context. Confirm no item/title step.
2. Choose/change/withdraw a card. Inspect the other participant's roster before revealing: its DOM must not contain that private value. Reveal from either participant; assert the authors and mode. Exercise ties and only `?`.
3. Clear from either participant. Toggle observer while open: own vote disappears and deck is absent. Observer can reveal/clear. Toggle after reveal: result remains frozen.
4. Open preferences. Change each suit; inspect the other context. Change language, sound and reduced motion. Escape closes the dialog and returns focus. Tab/Shift+Tab remain inside the open dialog.
5. Reload a voter with a selected card. Confirm restoration. Disconnect network, inspect disabled controls, then restore network and confirm the same selected card. Open a second tab with the same cookies: old tab becomes inert and provides explicit reconnect.
6. Reach 20 connected synthetic participants using isolated contexts. Inspect 360×800, 390×844, 768×1024 and 1440×900. Confirm no horizontal overflow, readable long/duplicate/Unicode names, and all controls reachable. At small portrait widths the 5×2 hand remains visible while scrolling the roster; at 568×320 it uses normal flow.
7. Use a mobile/touch context at 390×844. Reduce viewport height to 400 to simulate keyboard space, submit entry, restore height, tap vote/reveal/new round and preferences. This is browser emulation, not a physical iOS/Android certification.
8. Block localStorage through a context init fixture. App remains usable and language changes in memory. Emulate reduced motion at OS level and verify animation is disabled.
9. Block the initial `/assets/*.js` request. The bilingual static reload link must remain usable; remove the block and follow it to recover.
10. Keyboard-only entry: input, Tab, Enter, card Space/Enter, settings Tab/Escape. Test 200% browser zoom or equivalent 720-CSS-pixel reflow at a 1440-pixel window and record which method was actually used.
11. Unit/integration complements: audio dedup and browser refusal, 15-minute idle clock, transactional failure, stale-round and duplicate-command handling, protocol mismatch, 20-seat admission and commit-before-broadcast process crash.

## P06 idle replay with real browser input

Build the app, then run `node tests/browser/idle-fixture.mjs`. Through Playwright MCP open `http://127.0.0.1:3111`, create a synthetic table and choose 5. Wait for its confirmed pressed state. Type `idle` into the fixture process stdin; its server clock advances 900001 ms. Wait for the `Resume` button and disabled hand. Bring the page to front: it must remain paused. Press ArrowRight through Playwright keyboard input; wait for `Fibonacci Poker / Table connected`, then assert `Choose 5` is pressed and enabled. This validates a real trusted input event, not synthetic DOM event dispatch. Stop the fixture afterward; all its data is in memory.
