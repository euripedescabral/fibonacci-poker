# Primary references checked

Consulted 2026-10-20 for design; exact library patch compatibility is rechecked in P01. References support framework behavior, not proof that the planned implementation exists.

- https://preactjs.com/ — lightweight DOM UI and React-like component API.
- https://vite.dev/guide/ — build/dev tooling, Preact TypeScript template and Node compatibility.
- https://nodejs.org/en/about/previous-releases — choose a supported LTS line and pin the patch in P01.
- https://docs.colyseus.io/room — isolated rooms, lifecycle, disposal, limits and reconnection.
- https://docs.colyseus.io/state — server-authoritative state synchronization; private votes must not enter public schema.
- https://sqlite.org/wal.html — WAL concurrency and durability constraints.
- https://sqlite.org/backup.html — consistent online backups rather than unsafe live file copies.
- https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html — Origin, auth, validation, limits and logging boundaries.
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices — audio unlock through user interaction and user control.
- https://www.w3.org/TR/WCAG22/ — keyboard, focus, motion and accessible feedback targets.
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm — data lifecycle review for intended Brazilian operator context; release-specific applicability remains owner review.

Implementation must freeze tested versions in the npm lockfile; no floating latest in production images. No external source text or private workspace notes are reproduced here.
