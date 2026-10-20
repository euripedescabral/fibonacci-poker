import { Client } from "@colyseus/sdk";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
const base = process.env.LOAD_URL ?? "http://127.0.0.1:3000";
const origin = process.env.LOAD_ORIGIN ?? base;
const duration = Number(process.env.LOAD_SECONDS ?? 1800) * 1000;
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const clients = [],
  latencies = [];
let acknowledgments = 0,
  rounds = 0;
async function request(path, cookie, value) {
  const r = await fetch(base + path, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(value),
  });
  assert(r.ok, `${path}: ${r.status}`);
  return r;
}
async function join(tableId, cookie, index) {
  const { reservation } = await (
    await request(`/api/tables/${tableId}/join`, cookie, {
      name: `Synthetic ${index}`,
      schemaVersion: 1,
    })
  ).json();
  const room = await new Client(base, {
    headers: { Origin: origin },
  }).consumeSeatReservation(reservation);
  const c = { room, state: null, own: null, pending: new Map() };
  room.onStateChange((s) => {
    if (s.json) c.state = JSON.parse(s.json);
  });
  room.onMessage("sync", (s) => {
    c.state = s.state;
    c.own = s.own;
  });
  room.onMessage("complete", () => {});
  room.onMessage("ack", (r) => c.pending.get(r.commandId)?.(r));
  room.send("sync");
  for (let i = 0; !c.own && i < 200; i++) await pause(10);
  assert(c.own, "initial sync missing");
  return c;
}
async function command(c, type, payload = {}) {
  const commandId = randomUUID(),
    start = performance.now();
  const result = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(Error("Lost acknowledgment")),
      5000,
    );
    c.pending.set(commandId, (r) => {
      clearTimeout(timeout);
      c.pending.delete(commandId);
      resolve(r);
    });
  });
  c.room.send("command", {
    commandId,
    type,
    payload,
    roundId: c.state.roundId,
    sequence: c.own.lastSequence + 1,
  });
  const reply = await result;
  assert(reply.ok, JSON.stringify(reply));
  latencies.push(performance.now() - start);
  acknowledgments++;
  await pause(30);
}
try {
  const tables = [];
  for (let i = 0; i < 100; i++) {
    const cookie = (await request("/api/session", null, {})).headers
      .get("set-cookie")
      .split(";")[0];
    if (i % 20 === 0)
      tables.push(
        (await (await request("/api/tables", cookie, {})).json()).tableId,
      );
    clients.push(await join(tables.at(-1), cookie, i));
    await pause(1050);
  }
  const started = Date.now();
  console.log(
    JSON.stringify({
      event: "load_started",
      clients: clients.length,
      durationMs: duration,
    }),
  );
  while (Date.now() - started < duration) {
    for (const c of clients) c.room.send("activity");
    await Promise.all(
      clients.map((c, i) =>
        command(c, "vote", { value: [3, 5, 8, 13, 21][Math.floor(i / 20)] }),
      ),
    );
    await Promise.all(tables.map((_, i) => command(clients[i * 20], "reveal")));
    await pause(100);
    for (let i = 0; i < 100; i++) {
      assert.equal(clients[i].state.tableId, tables[Math.floor(i / 20)]);
      assert.equal(clients[i].state.revealed.cards.length, 20);
      assert.deepEqual(clients[i].state.revealed.result.values, [
        [3, 5, 8, 13, 21][Math.floor(i / 20)],
      ]);
    }
    await Promise.all(tables.map((_, i) => command(clients[i * 20], "clear")));
    rounds++;
    if (rounds === 1 || rounds % 5 === 0) {
      const sorted = [...latencies].sort((a, b) => a - b);
      console.log(
        JSON.stringify({
          event: "progress",
          seconds: Math.round((Date.now() - started) / 1000),
          rounds,
          acknowledgments,
          p95Ms: sorted[Math.floor(sorted.length * 0.95)],
        }),
      );
    }
    await pause(
      Math.min(10000, Math.max(0, duration - (Date.now() - started))),
    );
  }
  latencies.sort((a, b) => a - b);
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  console.log(
    JSON.stringify({
      event: "result",
      seconds: (Date.now() - started) / 1000,
      clients: 100,
      rounds,
      acknowledgments,
      p95Ms: p95,
      maxMs: latencies.at(-1),
    }),
  );
  assert(p95 <= 200, `p95 ${p95}ms exceeds 200ms`);
} finally {
  await Promise.all(clients.map((c) => c.room.leave()));
}
