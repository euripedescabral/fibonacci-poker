import { it, expect } from "vitest";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDatabase } from "../../apps/server/src/storage/database.js";
import { TableStore } from "../../apps/server/src/storage/tables.js";
it("survives process kill before COMMIT without corrupting acknowledged state", async () => {
  const dir = mkdtempSync(join(tmpdir(), "poker-kill-")),
    path = join(dir, "db.sqlite");
  const db = openDatabase(path);
  const table = new TableStore(db).create();
  db.close();
  try {
    const child = spawn(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `import Database from 'better-sqlite3';const db=new Database(process.argv[1]);db.exec('BEGIN IMMEDIATE');db.prepare('UPDATE tables SET suit=?').run('claw');process.stdout.write('pending');setInterval(()=>{},1000);`,
        path,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    await new Promise<void>((resolve, reject) => {
      child.once("error", reject);
      child.stdout.once("data", () => resolve());
    });
    const exit = new Promise((resolve) => child.once("exit", resolve));
    child.kill("SIGKILL");
    await exit;
    const recovered = openDatabase(path);
    try {
      expect(new TableStore(recovered).load(table.tableId).suit).toBe(
        table.suit,
      );
      expect(recovered.pragma("integrity_check", { simple: true })).toBe("ok");
    } finally {
      recovered.close();
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
it("reports actual SQLITE_FULL and permits writes after capacity recovers", () => {
  const db = openDatabase(":memory:");
  try {
    db.exec("CREATE TABLE fault_fixture(data BLOB)");
    const pages = db.pragma("page_count", { simple: true });
    db.pragma(`max_page_count=${pages}`);
    expect(() =>
      db
        .prepare("INSERT INTO fault_fixture VALUES(?)")
        .run(Buffer.alloc(1024 * 1024)),
    ).toThrow("database or disk is full");
    expect(db.prepare("SELECT COUNT(*) AS n FROM fault_fixture").get()).toEqual(
      { n: 0 },
    );
    db.pragma("max_page_count=10000");
    db.prepare("INSERT INTO fault_fixture VALUES(?)").run(Buffer.alloc(100));
    expect(db.pragma("integrity_check", { simple: true })).toBe("ok");
  } finally {
    db.close();
  }
});
