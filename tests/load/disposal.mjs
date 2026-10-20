import { start } from "../../dist/server/main.js";
import { Client } from "@colyseus/sdk";
import assert from "node:assert/strict";
let now = Date.now();
const app = await start({
  port: 0,
  origin: "auto",
  dbPath: ":memory:",
  now: () => now,
});
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const samples = [];
async function post(path, cookie, input) {
  const r = await fetch(app.url + path, {
    method: "POST",
    headers: {
      Origin: app.origin,
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(input),
  });
  assert(r.ok, `${path} ${r.status}`);
  return r;
}
try {
  const cookies = [];
  for (let i = 0; i < 2; i++)
    cookies.push(
      (await post("/api/session", null, {})).headers
        .get("set-cookie")
        .split(";")[0],
    );
  const { tableId } = await (await post("/api/tables", cookies[0], {})).json();
  let previous;
  for (let cycle = 0; cycle < 20; cycle++) {
    const clients = [];
    for (const cookie of cookies) {
      const { reservation } = await (
        await post(`/api/tables/${tableId}/join`, cookie, {
          name: "Disposal fixture",
          schemaVersion: 1,
        })
      ).json();
      const room = await new Client(app.url, {
        headers: { Origin: app.origin },
      }).consumeSeatReservation(reservation);
      room.onMessage("sync", () => {});
      clients.push(room);
    }
    const runtime = await app.directory.room(tableId);
    assert.notEqual(runtime.roomId, previous);
    previous = runtime.roomId;
    await Promise.all(clients.map((c) => c.leave()));
    for (let i = 0; runtime.connections.members.size && i < 200; i++)
      await pause(10);
    assert.equal(runtime.connections.members.size, 0);
    runtime.lifecycle.tick();
    now += 30001;
    runtime.lifecycle.tick();
    await pause(25);
    assert.equal(app.directory.rooms.size, 0);
    global.gc?.();
    samples.push({
      cycle,
      heap: process.memoryUsage().heapUsed,
      rss: process.memoryUsage().rss,
    });
  }
  const measured = samples.slice(5),
    growth = measured.at(-1).heap - measured[0].heap;
  assert(growth < 16 * 1024 * 1024, `Retained heap grew ${growth} bytes`);
  console.log(
    JSON.stringify({ cycles: 20, samples, retainedHeapGrowth: growth }),
  );
} finally {
  await app.close();
}
