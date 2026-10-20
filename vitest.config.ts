import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";
export default defineConfig({
  plugins: [preact()],
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    testTimeout: 15000,
    hookTimeout: 20000,
    fileParallelism: false,
  },
});
