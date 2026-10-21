import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { resolve } from "node:path";
import { pt } from "./src/i18n/pt.js";
import { en } from "./src/i18n/en.js";
export default defineConfig({
  cacheDir: resolve("node_modules/.vite/fp-web"),
  plugins: [
    preact(),
    {
      name: "localized-load-recovery",
      transformIndexHtml(html) {
        return html.replace(
          "<!--APP_FALLBACK-->",
          `<main class="loading-page boot-shell" aria-busy="true"><div class="loading-panel"><div class="loading-mark" aria-hidden="true"><svg viewBox="0 0 40 40" fill="currentColor"><path d="M20 3 32 18 27 33 20 37 9 25 11 14Z"/></svg></div><h1 class="loading-brand">Fibotable</h1><p class="loading-message" role="status" aria-atomic="true" id="boot-status">${pt.preparing} / ${en.preparing}</p><div class="boot-recovery"><p id="boot-hint">${pt.loadFailure} / ${en.loadFailure}</p><a id="boot-reload" href="">${pt.reload} / ${en.reload}</a></div></div></main>`,
        );
      },
    },
  ],
  build: { outDir: resolve("dist/web"), emptyOutDir: true },
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:3000",
      "/health": "http://127.0.0.1:3000",
      "/colyseus": {
        target: "ws://127.0.0.1:3000",
        ws: true,
        rewrite: (path) => path.replace(/^\/colyseus/, ""),
      },
    },
  },
});
