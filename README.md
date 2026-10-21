# Fibotable

Planning poker with persistent shared tables, Fibonacci cards and original fictional suits. Vote privately, reveal together and see the **mode: the most frequent value**, including ties.

**P01–P05 implemented; P06 operational tooling and isolated OVH verification are in progress.** Public deployment still requires the new domain configuration, a verified off-host backup job and final release facts. Initial audience: one Scrum team.

## Run locally

Use Node **24.18.0** (see `.node-version`).

```sh
npm ci
npm run build
APP_ORIGIN=http://127.0.0.1:3000 npm start
```

Open `http://127.0.0.1:3000`. SQLite is created under `data/`; keep that directory to reuse table links after restarting. Production must use HTTPS and `COOKIE_SECURE=true`.

For development, run `npm run dev` and `npm run dev:web` in separate terminals, then open `http://localhost:5173`. The Vite proxy carries API and WebSocket traffic to the backend. No account, task title or external service is needed.

## Included

- Reusable tables with up to 20 connected voters and observers.
- Fibonacci cards, private selection, shared reveal/clear, numerical mode and ties.
- Transactional SQLite persistence, reconnection, replacement-tab protection and 15-minute inactivity suspension.
- English/Portuguese, four original suits, optional completion sound and reduced motion.
- Compact mobile seating and a reachable 5×2 voting hand; keyboard and dialog focus support.

Stack: **Vite + Preact + TypeScript**, **Node.js + Colyseus**, **SQLite WAL**. Cards use SVG/CSS. Vite builds the UI; Preact renders it; Colyseus synchronizes rooms.

## Verify

```sh
npm run verify
npm run check:i18n
npm run build
npm run check:bundle
```

Verification includes domain, transactional storage, real SDK room integration, an isolated crash fixture and DOM tests. [Browser evidence](docs/reviews/ui-acceptance.md) records the separate Playwright MCP checks. Operational backup/privacy/recovery tests now run in `verify`. The separate 30-minute load runner targets isolated synthetic environments only; see [P06 release evidence](docs/reviews/release-evidence.md).

## Project contracts

- [KERNEL plan index](plans/README.md)
- [Product](docs/product.md), [architecture](docs/architecture.md), [protocol](docs/protocol.md)
- [UI flows](docs/ui.md), [acceptance matrix](docs/acceptance.md)
- [Security and release boundaries](docs/security.md)
- [Operations runbook](docs/operations.md), [release checklist](docs/release-checklist.md)
- [Original planning review](docs/reviews/plan-review.md)

This personal public repository does not imply a software license grant. The current no-license-grant policy is unchanged. Public domain, verified host region, provider configuration and recovery operations remain explicit P06 release checks.

## Brand

The product name is **Fibotable**, with no slogan. The existing repository slug and deployment/storage identifiers remain stable for compatibility; they are not the public brand.
