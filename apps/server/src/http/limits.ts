import { AppError } from "../../../../packages/contracts/src/index.js";
export class Limits {
  private buckets = new Map<string, { count: number; until: number }>();
  take(key: string, max: number, window: number, now = Date.now()): void {
    for (const [k, b] of this.buckets)
      if (b.until <= now) this.buckets.delete(k);
    let b = this.buckets.get(key);
    if (!b) {
      if (this.buckets.size >= 10000) throw new AppError("SERVER_BUSY");
      b = { count: 0, until: now + window };
      this.buckets.set(key, b);
    }
    if (++b.count > max) throw new AppError("RATE_LIMITED");
  }
}
