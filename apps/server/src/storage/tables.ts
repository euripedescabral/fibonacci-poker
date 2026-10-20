import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { AppError,type Snapshot,type Suit,type Vote } from '../../../../packages/contracts/src/index.js';
import { initialTable } from '../../../../packages/domain/src/index.js';
interface TableRow {table_id:string;round_id:string;revision:number;phase:'open'|'revealed';suit:Suit;completion_emitted:number;revealed_snapshot_json:string|null}
interface MemberRow {identity_id:string;display_name:string;mode:'voter'|'observer';seat_index:number;last_seen_at:number;last_sequence:number}
export class TableStore {
 constructor(public readonly db:Database.Database){}
 create():Snapshot {const s=initialTable(randomUUID(),randomUUID());this.save(s);return s;}
 load(id:string):Snapshot {
  const row=this.db.prepare('SELECT * FROM tables WHERE table_id=?').get(id) as TableRow|undefined;
  if(!row)throw new AppError('TABLE_NOT_FOUND');
  const s:Snapshot={tableId:id,roundId:row.round_id,revision:row.revision,phase:row.phase,suit:row.suit,completionEmitted:!!row.completion_emitted,members:{},votes:{},revealed:row.revealed_snapshot_json?JSON.parse(row.revealed_snapshot_json) as Snapshot['revealed']:null};
  const members=this.db.prepare('SELECT * FROM memberships WHERE table_id=?').all(id) as MemberRow[];
  for(const m of members)s.members[m.identity_id]={id:m.identity_id,name:m.display_name,mode:m.mode,connected:false,seat:m.seat_index,lastSeen:m.last_seen_at,lastSequence:m.last_sequence};
  for(const v of this.db.prepare('SELECT identity_id,value_json FROM votes WHERE table_id=? AND round_id=?').all(id,s.roundId) as {identity_id:string;value_json:string}[])s.votes[v.identity_id]=JSON.parse(v.value_json) as Vote;
  return s;
 }
 save(s:Snapshot):void {this.db.transaction(()=>this.write(s)).immediate();}
 write(s:Snapshot):void {
  this.db.prepare('INSERT INTO tables(table_id,revision,round_id,phase,suit,completion_emitted,revealed_snapshot_json,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(table_id) DO UPDATE SET revision=excluded.revision,round_id=excluded.round_id,phase=excluded.phase,suit=excluded.suit,completion_emitted=excluded.completion_emitted,revealed_snapshot_json=excluded.revealed_snapshot_json,updated_at=excluded.updated_at').run(s.tableId,s.revision,s.roundId,s.phase,s.suit,+s.completionEmitted,s.revealed?JSON.stringify(s.revealed):null,Date.now());
  const put=this.db.prepare('INSERT INTO memberships VALUES(?,?,?,?,?,?,?) ON CONFLICT(table_id,identity_id) DO UPDATE SET display_name=excluded.display_name,mode=excluded.mode,seat_index=excluded.seat_index,last_seen_at=excluded.last_seen_at,last_sequence=excluded.last_sequence');
  for(const m of Object.values(s.members))put.run(s.tableId,m.id,m.name,m.mode,m.seat,m.lastSeen,m.lastSequence);
  this.db.prepare('DELETE FROM votes WHERE table_id=?').run(s.tableId);
  const vote=this.db.prepare('INSERT INTO votes VALUES(?,?,?,?,?)');
  for(const [id,value] of Object.entries(s.votes))vote.run(s.tableId,s.roundId,id,JSON.stringify(value),Date.now());
 }
}
