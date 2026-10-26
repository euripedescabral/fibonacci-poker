import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// October 2026 security fixes must cover both build and production runtimes.
const floor = "24.22.1";
const pin = readFileSync(".node-version", "utf8").trim();
const parts = (version) => version.split(".").map(Number);
const atLeast = (version, minimum) => {
  const a = parts(version), b = parts(minimum);
  return a[0] === b[0] && (a[1] > b[1] || (a[1] === b[1] && a[2] >= b[2]));
};
assert(atLeast(pin, floor), `Node pin must be >=${floor} <25`);
assert(atLeast(process.versions.node, pin), `Use Node >=${pin} <25`);
const manifest = JSON.parse(readFileSync("package.json", "utf8"));
assert.equal(manifest.engines.node, `>=${pin} <25`);
const bases = [...readFileSync("Dockerfile", "utf8").matchAll(/^FROM node:([^\s]+)/gm)];
assert.equal(bases.length, 2);
assert(bases.every(([, base]) => base === `${pin}-bookworm-slim`), "Docker stages must match the Node pin");
console.log(`PASS patched Node runtime ${process.versions.node}; build/runtime pins ${pin}`);
