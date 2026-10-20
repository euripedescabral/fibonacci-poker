import { describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { Room } from "@colyseus/core";
import { Client } from "@colyseus/sdk";
import { Schema } from "@colyseus/schema";
import { build } from "vite";
import preact from "@preact/preset-vite";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
describe("installed toolchain", () => {
  it("loads native SQLite and SDK exports", () => {
    const db = new Database(":memory:");
    expect(db.prepare("select 42 as answer").get()).toEqual({ answer: 42 });
    db.close();
    expect(Room).toBeTypeOf("function");
    expect(Client).toBeTypeOf("function");
    expect(Schema).toBeTypeOf("function");
  });
  it("builds a Preact TSX fixture", async () => {
    const dir = mkdtempSync(join(process.cwd(), ".fixture-"));
    try {
      writeFileSync(
        join(dir, "index.html"),
        '<div id="app"></div><script type="module" src="/main.tsx"></script>',
      );
      writeFileSync(
        join(dir, "main.tsx"),
        "import {render} from 'preact'; render(<button>Ready</button>,document.getElementById('app')!);",
      );
      await build({
        root: dir,
        configFile: false,
        plugins: [preact()],
        logLevel: "silent",
        build: { write: false },
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("uses a disk database with WAL", () => {
    const dir = mkdtempSync(join(tmpdir(), "fp-"));
    const db = new Database(join(dir, "test.sqlite"));
    try {
      db.pragma("journal_mode=WAL");
      expect(db.pragma("journal_mode", { simple: true })).toBe("wal");
    } finally {
      db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
