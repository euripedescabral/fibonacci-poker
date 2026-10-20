import { AppError } from "../../../../packages/contracts/src/index.js";
export class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve();
  private pending = 0;
  run<T>(job: () => T | Promise<T>): Promise<T> {
    if (this.pending >= 128)
      return Promise.reject(new AppError("RATE_LIMITED"));
    this.pending++;
    const next = this.tail.then(job);
    this.tail = next.catch(() => undefined);
    return next.finally(() => {
      this.pending--;
    });
  }
}
