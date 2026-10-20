import { expect, it } from "vitest";
import { SerialQueue } from "../../apps/server/src/rooms/queue.js";
it("serializes concurrent changes and recovers after a rejected job", async () => {
  const q = new SerialQueue();
  const seen: number[] = [];
  await Promise.all([
    q.run(async () => {
      await new Promise((r) => setTimeout(r, 5));
      seen.push(1);
    }),
    q
      .run(() => {
        seen.push(2);
        throw Error("fixture");
      })
      .catch(() => undefined),
    q.run(() => seen.push(3)),
  ]);
  expect(seen).toEqual([1, 2, 3]);
});
it("rejects overload before admitting work", async () => {
  const q = new SerialQueue();
  let done!: () => void;
  const blocker = new Promise<void>((r) => {
    done = r;
  });
  const tasks = Array.from({ length: 128 }, () => q.run(() => blocker));
  await expect(q.run(() => undefined)).rejects.toMatchObject({
    code: "RATE_LIMITED",
  });
  done();
  await Promise.all(tasks);
});
