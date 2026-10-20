// Test server only; never included in the runtime image or public deployment.
// Build first, launch with Node, then type "idle" into stdin to advance 15 minutes.
import { start } from "../../dist/server/main.js";
let now = Date.now();
const app = await start({
  port: 3111,
  origin: "http://127.0.0.1:3111",
  dbPath: ":memory:",
  now: () => now,
});
process.stdin.setEncoding("utf8");
process.stdin.on("data", (value) => {
  if (value.trim() === "idle") {
    now += 900001;
    console.log("clock_advanced");
  }
});
console.log("idle_fixture_ready");
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => {
    void app.close().then(() => process.exit(0));
  });
