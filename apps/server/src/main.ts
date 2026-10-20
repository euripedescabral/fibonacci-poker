import { createServer } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { openDatabase } from "./storage/database.js";
import { TableStore } from "./storage/tables.js";
import { Sessions } from "./identity/session.js";
import { Tickets } from "./identity/tickets.js";
import { Directory } from "./rooms/directory.js";
import { TableRoom } from "./rooms/table-room.js";
import { routes } from "./http/routes.js";
export interface Options {
  port?: number;
  origin?: string;
  dbPath?: string;
  secure?: boolean;
  staticRoot?: string;
  maxTables?: number;
  now?: () => number;
  afterCommit?: () => void;
}
export async function start(options: Options = {}) {
  const http = createServer();
  const db = openDatabase(
    options.dbPath ?? process.env.DB_PATH ?? "data/poker.sqlite",
  );
  const store = new TableStore(db);
  const tickets = new Tickets();
  const sessions = new Sessions(db);
  const directory = new Directory(options.maxTables ?? 20);
  let ready = false;
  let expectedOrigin =
    options.origin ?? process.env.APP_ORIGIN ?? "http://localhost:5173";
  const transport = new WebSocketTransport({
    server: http,
    maxPayload: 4096,
    perMessageDeflate: false,
    beforeUpgrade: (req) =>
      req.headers.get("origin") === expectedOrigin
        ? undefined
        : new Response(null, { status: 403 }),
  });
  const game = new Server({
    transport,
    gracefullyShutdown: false,
    greet: false,
    logger: {
      debug() {},
      info() {},
      trace() {},
      warn() {
        console.warn("transport_warning");
      },
      error() {
        console.error("transport_error");
      },
    },
  });
  game.define("table", TableRoom, {
    store,
    tickets,
    now: options.now ?? Date.now,
    disposed: (id: string) => directory.forget(id),
    afterCommit: options.afterCommit,
  });
  await game.listen(
    options.port ?? Number(process.env.PORT ?? 3000),
    "127.0.0.1",
  );
  const port = (http.address() as { port: number }).port;
  if (options.origin === "auto") expectedOrigin = "http://127.0.0.1:" + port;
  // Replace this server's default public matchmaking routes with capability-only APIs.
  http.removeAllListeners("request");
  const handler = routes({
    sessions,
    tickets,
    store,
    directory,
    origin: expectedOrigin,
    secure: options.secure ?? process.env.COOKIE_SECURE === "true",
    staticRoot: options.staticRoot ?? "dist/web",
    ready: () => ready,
  });
  http.on("request", (req, res) => {
    void handler(req, res);
  });
  ready = true;
  return {
    url: "http://127.0.0.1:" + port,
    origin: expectedOrigin,
    store,
    directory,
    close: async () => {
      ready = false;
      await game.gracefullyShutdown(false);
      db.close();
    },
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const app = await start();
  console.info("Fibonacci Poker listening");
  for (const signal of ["SIGTERM", "SIGINT"] as const)
    process.once(signal, () => {
      void app.close().then(() => process.exit(0));
    });
}
