import { createHash, randomUUID } from 'node:crypto';
import { AppError,type Snapshot,type Command,type Reply } from '../../../../packages/contracts/src/index.js';
import { transition } from '../../../../packages/domain/src/index.js';
import type { TableStore } from './tables.js';
export interface Applied {state:Snapshot;reply:Reply;replayed:boolean}
export function executeCommand(store:TableStore,state:Snapshot,id:string,command:Command,beforeCommit?:()=>void):Applied {
 try{return store.db.transaction(()=>{
  const hash=createHash('sha256').update(JSON.stringify(command)).digest('hex');
  const receipt=store.db.prepare('SELECT payload_hash,result_json FROM command_receipts WHERE table_id=? AND identity_id=? AND command_id=?').get(state.tableId,id,command.commandId) as {payload_hash:string;result_json:string}|undefined;
  if(receipt){if(receipt.payload_hash!==hash)throw new AppError('COMMAND_CONFLICT');return {state,reply:JSON.parse(receipt.result_json) as Reply,replayed:true};}
  const last=store.db.prepare('SELECT last_sequence FROM memberships WHERE table_id=? AND identity_id=?').get(state.tableId,id) as {last_sequence:number}|undefined;
  if(!state.members[id]?.connected||!last)throw new AppError('SESSION_EXPIRED');
  if(command.sequence<=last.last_sequence)throw new AppError('ALREADY_PROCESSED');
  const next=transition(state,id,command,randomUUID());
  store.write(next);
  const reply:Reply={ok:true,commandId:command.commandId,roundId:next.roundId,revision:next.revision};
  store.db.prepare('INSERT INTO command_receipts VALUES(?,?,?,?,?,?,?)').run(state.tableId,id,command.commandId,state.roundId,command.sequence,hash,JSON.stringify(reply));
  if(command.type==='clear')store.db.prepare('DELETE FROM command_receipts WHERE table_id=? AND round_id NOT IN (?,?)').run(state.tableId,state.roundId,next.roundId);
  store.db.prepare('DELETE FROM command_receipts WHERE table_id=? AND identity_id=? AND round_id=? AND command_id NOT IN (SELECT command_id FROM command_receipts WHERE table_id=? AND identity_id=? AND round_id=? ORDER BY sequence DESC LIMIT 100)').run(state.tableId,id,state.roundId,state.tableId,id,state.roundId);
  beforeCommit?.();return {state:next,reply,replayed:false};
 }).immediate();}catch(error){if(error instanceof AppError)throw error;throw new AppError('STORAGE_UNAVAILABLE');}
}
