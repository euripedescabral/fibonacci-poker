import { IDLE_MS } from '../../../../packages/contracts/src/index.js';
import type { TableRoom } from './table-room.js';
export class Lifecycle {
 private emptySince:number|null=null;
 constructor(private room:TableRoom,private now:()=>number){}
 tick():void{
  const now=this.now();for(const [id,last] of this.room.connections.activity)if(now-last>=IDLE_MS)this.room.connections.members.get(id)?.leave(4002,'IDLE');
  if(this.room.connections.members.size||this.room.hasReservations(now)){this.emptySince=null;return;}
  this.emptySince??=now;if(now-this.emptySince>=30000)void this.room.disconnect();
 }
}
