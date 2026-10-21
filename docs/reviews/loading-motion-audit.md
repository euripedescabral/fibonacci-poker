# Loading and motion audit

Reviewed on 2026-10-21 against the deployed 42b81e8 frontend. This is a targeted Preact review of startup, submission, connection recovery, preferences and CSS motion.

## Findings and changes

| Finding | Impact | Change |
|---|---|---|
| Raw bilingual fallback depended on application styling | Inconsistent first paint/recovery screen | Independent small branded CSS shell; locale applied by bootstrap; reload works if app chunk fails |
| Session preparation shared the create/submit busy flag | “Creating” before a user requested a table | Separate bootstrap and submission states |
| Returning member saw entry while connection was pending | Misleading form and keyboard activation | Restoring state stays on loading until private sync arrives; entry no longer autofocuses |
| Session failure had no actual initialization retry | Retrying submit could not repair session initialization | Retry reruns initialization; missing tables offer home; expired sessions reload |
| Socket handshake/private sync had no overall deadline | Initial loading could remain stuck | 15-second attempt deadline, bounded existing retries, stale generation guards and late-room cleanup |
| Stored `null` preferences crashed property access | Blank application on malformed local storage | Validate parsed preference shape and fall back safely |
| Background-color transition, filtered hero shadow and modal backdrop blur | Avoidable paint/filter work | Short transform-only card transitions, fine-pointer hover, existing static shadows/opaque backdrop |
| Saved motion preference applied after paint | Brief unwanted motion during mount | Bootstrap attribute and layout effect; OS reduction still wins |
| Long tied-mode list used fixed large type | Narrow-screen overflow risk | Responsive font size and wrapping |

## Validation

- 89 tests across 26 files passed, including delayed initialization/metadata, returning member, reconnect retaining table, duplicate submit prevention, failed creation preserving name, initialization retry, handshake and sync deadlines, stale sync, malformed preferences and OS/explicit reduced motion.
- Typecheck, lint, plan consistency, 105 translation keys, production build and bundle limit passed.
- Local built server on port 3112: readiness, standalone shell/reload link, bootstrap CSS/JS MIME and unchanged CSP passed.
- Local three-client SDK replay: 25 commands passed, including hidden values, mode/ties, observers, suits and private-vote restoration. This exercises the application protocol, not visual browser behavior.
- Initial JavaScript is approximately 10.24 kB gzip instead of the previous single 93.55 kB application bundle (Vite estimates). The app chunk follows on demand; total gzip measured by the existing gate is 94,153 bytes, slightly larger than before. This improves progressive delivery; it does not establish a measured LCP/INP improvement.
- No new animation dependency, artificial progress percentage, forced minimum wait or permanent `will-change`. Loading pulses three times at most, then stays still. Motion uses transform/opacity and obeys both motion settings.
- Playwright MCP returns `Transport closed`; desktop/mobile visual replay, actual blocked-chunk browser behavior, screen-reader announcements and CPU/FPS traces remain unverified. Replay instructions are in [browser scenarios](../../tests/browser/scenarios.md).

## Sources

[Chrome team's animation performance guidance](https://web.dev/articles/animations-and-performance) supports avoiding layout/paint properties and excessive layer promotion. [W3C status-message guidance](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22.html) supports polite atomic status regions. Existing product CSS and Preact contracts take precedence over framework-specific recommendations from other stacks.
