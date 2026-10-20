# OVH preflight — 2026-10-20

Decision: isolated implementation/testing is allowed and verified; public release remains on hold for provider configuration. The owner explicitly authorized deployment, so another release-permission prompt is not required.

Read-only inventory found Docker 29.2.1, Traefik 3.6.7, an attachable external `dokploy-network`, approximately 9 GiB available RAM and 78 GiB free disk. Existing applications, databases and Dokploy services remain separate. No existing service was stopped, restarted or reconfigured.

Traefik listens on 80/443 and watches the file-provider directory. Existing applications use separate file-provider routes and a Cloudflare origin certificate. The proposed poker route uses unique router/service/middleware names and its own container, volume and origin. `ops/traefik.yml` is an uninstalled template. The candidate public hostname is `poker.agentshorts.dev`, subject to the owner's domain preference and actual DNS/certificate verification. It currently has no DNS record. An actual origin TLS handshake confirms the installed certificate covers `*.agentshorts.dev` and `agentshorts.dev`; edge DNS/HTTPS/WSS are still unverified.

No host application/database port is added by production Compose. The poker process runs as UID 1000 with a read-only root, dropped capabilities, no-new-privileges, a dedicated data volume and bounded resource/log limits. Recovery/load fixtures use distinct containers and volumes with synthetic data only; they have no public route.

The local Docker daemon was unresponsive, so Docker build and runtime recovery gates ran on an isolated part of the authorized OVH host. Local Compose configuration validation passed. The implementation does not restart the shared proxy or alter other projects.

Unresolved facts:

- Cloudflare dashboard session is logged out; no connected DNS/R2 management plugin was found. Existing provider authentication was requested asynchronously.
- No private off-host bucket or key escrow has been configured for this application. S3-compatible transport is implemented and locally tested, but provider round-trip evidence is still missing.
- Reverse DNS identifies an OVH `.ca` VPS hostname. This is insufficient proof of the actual hosting facility/region; confirm against the provider account before setting the public notice.
- Owner's intended audience is their team. Applicable provider terms/processing basis and the final contact route require owner confirmation for the deployed context; no jurisdiction or compliance claim is invented.

Operator identity is Eurípedes Cabral. The public notice links the owner's professional profile for private contact. No application license grant is introduced. Third-party notices are included with the browser build; the runtime image retains installed dependencies' license files.
