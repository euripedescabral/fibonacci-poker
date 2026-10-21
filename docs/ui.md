# UI and localization contract

One entry screen and one table screen, plus a small /privacy information route accessible from entry/settings. No task/item editor. Dark felt-green table, original fictional suits, light cards and visible names. Desktop participants around the table; narrow screens use a compact roster/grid and an accessible deck below. Observers have a labeled eye-icon strip, never only an icon. Offline states use text plus styling. A full light theme is not in MVP scope; contrast/accessibility of the chosen theme is mandatory.

Default viewports: 360×800, 768×1024, 1440×900; no page horizontal overflow, use wrapping/pagination for the deck rather than inaccessible offscreen controls. At 20 people, names remain readable and all controls reachable. Focus order follows DOM reading order, not visual seat coordinates.

Portuguese dictionary `pt` and English `en`; identical keys checked by a script. No hardcoded UI copy in components, including labels, errors, aria strings, observer badges, sound messages and empty/loading states. Routes and protocol values remain language-independent. System locale fallback and override defined in product contract. “Reduzir movimento / Reduce motion” has no nausea-related label.

## Layer 3.2 — UI Flow Matrix

| Flow | Entry / action | Pending PT / EN | Success | Error / recovery | Role | Theme / keyboard |
|---|---|---|---|---|---|---|
| Create | Name → Create table | Criando… / Creating… | Navigate + share link | Retain name, retry | Any session | Dark AA; Enter submits |
| Join | Link + name → Join | Entrando… / Joining… | Seat or observer strip | Full/unknown/expired named explicitly; retry/back home | Any session | Focus first input; Enter |
| Vote/change | Deck card | Enviando… / Sending… | Own selection + face-down public card | Roll back pending selection; keep last confirmed vote | Voter/open | Buttons with aria-pressed; Enter/Space |
| Withdraw | Selected card again | Recolhendo… / Withdrawing… | Empty seat card | Restore confirmed selection | Voter/open | Same card remains focused |
| Observe | Toggle on | Alterando… / Switching… | Observer strip; open vote withdrawn | Preserve old mode/card | Member | Labeled switch |
| Become voter | Toggle off | Alterando… / Switching… | Seat + deck; wait if revealed | Preserve mode | Observer | Focus moves only if control disappears |
| Reveal | Reveal with pending count | Revelando… / Revealing… | All submitted cards + mode/ties | No votes, stale round or write failure shown | All members | Button; result aria-live polite |
| Clear | New round / clear | Limpando… / Clearing… | Fresh round; roster/settings unchanged | No false clearing on write error | All members | Focus stays on round action |
| Copy invite | Copy link | Copiando… / Copying… | Copiado / Copied | Show selectable link on clipboard failure | Member | Button and live announcement |
| Suit | Settings selection | Salvando… / Saving… | Shared card family updated | Revert to confirmed suit | Member | Labeled radio group |
| Language | Settings PT/EN | Immediate | All text switches, saved locally | Storage blocked → session-only preference | Everyone | Labeled select |
| Sound | Settings toggle | Immediate | Choice stored; audio armed by gesture | Browser refusal keeps silent and shows hint | Everyone | Switch + text, no audio-only feedback |
| Reduce motion | Settings toggle | Immediate | All animations stop instantly | OS reduction always respected | Everyone | Switch; zero-motion screenshots |
| Connection lost | Network closes | Reconectando… / Reconnecting… | Full snapshot + own vote | Disable mutations; capped retries then explicit Retry | Member | Status region; do not trap focus |
| Idle | 15 min no activity | Pausado por inatividade / Paused for inactivity | Next real input reconnects | No automatic heartbeat reconnect loop | Member | Visible Resume button, keyboard activity |
| Replacement | Second tab joins | Conexão aberta em outra aba / Connected in another tab | Old tab inert | Explicit Reconnect can take over | Member | Status + action |
| Late join | Revealed room | Aguardando nova rodada / Waiting for next round | See current result; can clear | No hidden new vote | Member | Deck disabled with reason |
| Client outdated | Protocol mismatch or missing deployed chunk | Atualização disponível / Update available | Reload current app | No infinite retry; explicit Reload | Member | Accessible button |
| Empty/observers only | No active voters | Aguardando votantes / Waiting for voters | No completion sound | Enable voting toggle, no dead end | Member | Informative text |

Settings dialog: semantic dialog, labeled heading, focus trap while open, Escape closes, focus returns to opener. Card content is readable text; suit SVG is decorative/aria-hidden. Respect prefers-reduced-motion and user's setting. Motion durations: card slide 180 ms, flip 220 ms, feedback 120 ms; all become zero when reduced. No flashes, loops, parallax, confetti or sound on hover.

Acceptance includes keyboard-only operation, screen-reader meaningful names/result, 200% zoom, long/duplicate Unicode names, error announcements, mobile overflow, contrast and touch targets. Browser acceptance uses Playwright MCP, with separate authenticated contexts for distinct people; never reuse another session's browser profile.

## Brand

The public name is **Fibotable** in both locales, with no slogan. Use functional headings and instructions. Preserve the original fictional suit symbol and selectable suits. Deployment/storage identifiers are compatibility details and are not displayed as branding.
