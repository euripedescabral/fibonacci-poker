import type { IncomingMessage, ServerResponse } from "node:http";
import { AppError } from "../../../../packages/contracts/src/index.js";
export function headers(res: ServerResponse): void {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "no-store");
}
export function origin(req: IncomingMessage, expected: string): void {
  if (req.headers.origin !== expected) throw new AppError("INVALID_INPUT");
}
export async function body(
  req: IncomingMessage,
): Promise<Record<string, unknown>> {
  if (!req.headers["content-type"]?.startsWith("application/json"))
    throw new AppError("INVALID_INPUT");
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const b = Buffer.from(chunk as Uint8Array);
    size += b.length;
    if (size > 4096) throw new AppError("INVALID_INPUT");
    chunks.push(b);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString());
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw Error();
    return value as Record<string, unknown>;
  } catch {
    throw new AppError("INVALID_INPUT");
  }
}
// Forwarded headers remain untrusted until P06 verifies the actual OVH proxy hop.
export function address(req: IncomingMessage): string {
  return req.socket.remoteAddress ?? "unknown";
}
