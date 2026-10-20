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
          `<main><p>${pt.loading} / ${en.loading}</p><p>${pt.loadFailure} / ${en.loadFailure}</p><a href="">${pt.reload} / ${en.reload}</a></main>`,
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
