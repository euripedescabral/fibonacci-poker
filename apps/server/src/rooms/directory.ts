import { matchMaker } from "@colyseus/core";
import { AppError } from "../../../../packages/contracts/src/index.js";
import type { TableRoom } from "./table-room.js";
export class Directory {
  private rooms = new Map<
    string,
    Promise<Awaited<ReturnType<typeof matchMaker.createRoom>>>
  >();
  constructor(private maximum = 20) {}
  async wake(id: string) {
    let pending = this.rooms.get(id);
    if (!pending) {
      if (this.rooms.size >= this.maximum) throw new AppError("SERVER_BUSY");
      pending = matchMaker.createRoom("table", { tableId: id });
      this.rooms.set(id, pending);
      pending.catch(() => this.rooms.delete(id));
    }
    return pending;
  }
  forget(id: string): void {
    this.rooms.delete(id);
  }
  async room(id: string): Promise<TableRoom> {
    const room = await this.wake(id);
    return matchMaker.getLocalRoomById(room.roomId) as TableRoom;
  }
}
