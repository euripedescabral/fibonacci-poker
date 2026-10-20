FROM node:24.18.0-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/domain/package.json packages/domain/package.json
RUN npm ci
COPY . .
ARG VITE_HOSTING_REGION
ARG VITE_RELEASE_READY=false
ENV VITE_HOSTING_REGION=$VITE_HOSTING_REGION VITE_RELEASE_READY=$VITE_RELEASE_READY
RUN npm run build && npm prune --omit=dev
FROM node:24.18.0-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DB_PATH=/data/poker.sqlite COOKIE_SECURE=true
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/ops ./ops
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/apps/server/src/storage/migrations ./apps/server/src/storage/migrations
RUN mkdir /data /backups /ledger && chown node:node /data /backups /ledger && chmod 700 /data /backups /ledger
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server/main.js"]
