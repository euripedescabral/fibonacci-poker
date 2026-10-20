import { Client } from "@colyseus/sdk";
import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
const base = process.env.FIXTURE_URL ?? "http://fibonacci-poker-recovery:3000";
const file = process.env.FIXTURE_STATE ?? "/fixture/state.json";
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function post(path, cookie, input) {
  const r = await fetch(base + path, {
    method: "POST",
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(input),
  });
  assert(r.ok, `HTTP ${r.status}`);
  return r;
}
for (let n = 0; ; n++) {
  try {
    assert((await fetch(base + "/health/ready")).ok);
    break;
  } catch (error) {
    if (n === 100) throw error;
    await pause(100);
  }
}
let fixture;
if (process.argv[2] === "seed") {
  const cookie = (await post("/api/session", null, {})).headers
    .get("set-cookie")
    .split(";")[0];
  const { tableId } = await (await post("/api/tables", cookie, {})).json();
  fixture = { cookie, tableId };
} else fixture = JSON.parse(readFileSync(file, "utf8"));
const { reservation } = await (
  await post(`/api/tables/${fixture.tableId}/join`, fixture.cookie, {
    name: "Recovery fixture",
    schemaVersion: 1,
  })
).json();
const room = await new Client(base, {
  headers: { Origin: base },
}).consumeSeatReservation(reservation);
let own, state;
const pending = new Map();
room.onStateChange((s) => {
  if (s.json) state = JSON.parse(s.json);
});
room.onMessage("sync", (s) => {
  own = s.own;
  state = s.state;
});
room.onMessage("complete", () => {});
room.onMessage("ack", (r) => pending.get(r.commandId)?.(r));
room.send("sync");
for (let n = 0; !own; n++) {
  assert(n < 100);
  await pause(20);
}
try {
  if (process.argv[2] === "seed") {
    for (const action of [
      { type: "vote", payload: { value: 8 } },
      { type: "reveal", payload: {} },
    ]) {
      const commandId = randomUUID();
      const reply = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(Error("ACK timeout")), 5000);
        pending.set(commandId, (r) => {
          clearTimeout(timer);
          resolve(r);
        });
      });
      room.send("command", {
        ...action,
        commandId,
        sequence: own.lastSequence + 1,
        roundId: state.roundId,
      });
      assert((await reply).ok);
      await pause(50);
    }
    fixture.roundId = state.roundId;
    writeFileSync(file, JSON.stringify(fixture), { mode: 0o600 });
  }
  assert.equal(own.value, 8);
  assert.equal(state.roundId, fixture.roundId);
  assert.equal(state.phase, "revealed");
  assert.deepEqual(state.revealed.result, {
    kind: "mode",
    values: [8],
    count: 1,
  });
  console.log("recovery_fixture_pass");
} finally {
  await room.leave();
}
