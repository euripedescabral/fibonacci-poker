import { it, expect } from "vitest";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { Client } from "@colyseus/sdk";
import { harness, waitFor } from "./harness.js";
it("recovers a command committed immediately before a process crash, without replaying sound", async () => {
  const dir = mkdtempSync(join(tmpdir(), "fp-crash-")),
    dbPath = join(dir, "test.sqlite");
  const child = spawn(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      "import {start} from './apps/server/src/main.ts';const app=await start({port:0,origin:'auto',dbPath:process.env.FIXTURE_DB,afterCommit:()=>process.exit(77)});console.log(JSON.stringify({url:app.url}));",
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, FIXTURE_DB: dbPath },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  try {
    const url = await new Promise<string>((resolve, reject) => {
      let out = "";
      child.stdout.on("data", (chunk) => {
        out += String(chunk);
        const line = out.split("\n").find((s) => s.startsWith("{"));
        if (line) resolve((JSON.parse(line) as { url: string }).url);
      });
      child.once("error", reject);
      child.once("exit", () => reject(Error("fixture exited before ready")));
    });
    const post = (path: string, cookie: string, value: unknown) =>
      fetch(url + path, {
        method: "POST",
        headers: {
          Origin: url,
          Cookie: cookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
      });
    const session = await post("/api/session", "", {});
    const cookie = session.headers.get("set-cookie")!.split(";")[0]!;
    const { tableId } = await (await post("/api/tables", cookie, {})).json();
    const { reservation } = await (
      await post("/api/tables/" + tableId + "/join", cookie, {
        name: "Crash fixture",
        schemaVersion: 1,
      })
    ).json();
    const room = await new Client(url, {
      headers: { Origin: url },
    }).consumeSeatReservation(reservation);
    room.onMessage("sync", () => undefined);
    room.onMessage("ack", () => undefined);
    room.onMessage("complete", () => undefined);
    const sync = await new Promise<{ state: { roundId: string } }>(
      (resolve) => {
        room.onMessage("sync", resolve);
        room.send("sync");
      },
    );
    const exit = once(child, "exit");
    room.send("command", {
      commandId: randomUUID(),
      sequence: 1,
      roundId: sync.state.roundId,
      type: "vote",
      payload: { value: 21 },
    });
    expect((await exit)[0]).toBe(77);
    const recovered = await harness({ dbPath });
    try {
      const client = await recovered.join(tableId, cookie);
      expect(client.own.value).toBe(21);
      expect(client.own.lastSequence).toBe(1);
      expect(client.completions).toEqual([]);
    } finally {
      await recovered.close();
    }
  } finally {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      await once(child, "exit");
    }
    rmSync(dir, { recursive: true, force: true });
  }
});

it("keeps published state unchanged on real SQLITE_FULL and accepts a later retry", async () => {
  const h = await harness();
  try {
    const ca = await h.identity(),
      cb = await h.identity(),
      id = await h.create(ca);
    const a = await h.join(id, ca),
      b = await h.join(id, cb);
    h.store.db.exec(
      "CREATE TABLE full_fixture(data BLOB); CREATE TRIGGER force_full AFTER INSERT ON votes BEGIN INSERT INTO full_fixture VALUES(zeroblob(1048576)); END;",
    );
    h.store.db.pragma(
      `max_page_count=${h.store.db.pragma("page_count", { simple: true })}`,
    );
    expect(
      await a.command({ type: "vote", payload: { value: 8 } }),
    ).toMatchObject({ ok: false, code: "STORAGE_UNAVAILABLE" });
    expect(a.own.value).toBeNull();
    expect(a.state.submitted).toBe(0);
    expect(b.state.submitted).toBe(0);
    expect(h.store.load(id).votes).toEqual({});
    h.store.db.exec("DROP TRIGGER force_full");
    h.store.db.pragma("max_page_count=10000");
    expect(
      await a.command({ type: "vote", payload: { value: 8 } }),
    ).toMatchObject({ ok: true });
    await waitFor(() => b.state.submitted === 1);
    expect(a.own.value).toBe(8);
    expect(b.own.value).toBeNull();
  } finally {
    await h.close();
  }
});
