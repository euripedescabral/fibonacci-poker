import type { ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
export async function serveStatic(
  path: string,
  res: ServerResponse,
  root: string,
): Promise<void> {
  const base = resolve(root);
  const asset = path.startsWith("/assets/");
  const target = asset
    ? resolve(base, "." + path)
    : resolve(base, "index.html");
  if (!target.startsWith(base + sep)) {
    res.writeHead(404).end();
    return;
  }
  try {
    const data = await readFile(target);
    res.setHeader(
      "Content-Type",
      (
        {
          ".html": "text/html; charset=utf-8",
          ".js": "text/javascript",
          ".css": "text/css",
          ".svg": "image/svg+xml",
        } as Record<string, string>
      )[extname(target)] ?? "application/octet-stream",
    );
    res.setHeader(
      "Cache-Control",
      asset ? "public, max-age=31536000, immutable" : "no-cache",
    );
    res.end(data);
  } catch {
    res.writeHead(404).end();
  }
}
