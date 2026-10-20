import { expect, it, vi } from "vitest";
import { harness } from "./harness.js";
it("rejects foreign origin, oversized JSON and public matchmaking", async () => {
  const h = await harness();
  try {
    expect(
      (
        await fetch(h.url + "/api/session", {
          method: "POST",
          headers: {
            Origin: "https://foreign.example",
            "Content-Type": "application/json",
          },
          body: "{}",
        })
      ).status,
    ).toBe(400);
    expect(
      (await h.request("/api/session", "", { name: "x".repeat(5000) })).status,
    ).toBe(400);
    expect(
      (await fetch(h.url + "/matchmake/create/table", { method: "POST" }))
        .status,
    ).toBe(404);
    expect(
      (await fetch(h.url + "/health/live")).headers.get(
        "content-security-policy",
      ),
    ).toContain("frame-ancestors 'none'");
  } finally {
    await h.close();
  }
});


it("ignores forged forwarding headers before WebSocket authentication", async () => {
  const { TableRoom } = await import("../../apps/server/src/rooms/table-room.js");
  const auth = vi.spyOn(TableRoom.prototype, "onAuth");
  const h = await harness();
  try {
    const cookie = await h.identity(), id = await h.create(cookie);
    await h.join(id, cookie, "Proxy fixture", {"X-Forwarded-For":"198.51.100.9", "X-Real-IP":"198.51.100.8", "X-Client-IP":"198.51.100.7"});
    expect(auth.mock.calls[0]?.[2].ip).toBe("127.0.0.1");
  } finally { await h.close(); auth.mockRestore(); }
});
