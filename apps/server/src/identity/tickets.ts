import { randomBytes } from 'node:crypto';
import { AppError } from '../../../../packages/contracts/src/index.js';
export interface Ticket {id:string;tableId:string;name:string;expires:number}
export class Tickets {
 private values=new Map<string,Ticket>();
 issue(id:string,tableId:string,name:string,now=Date.now()):string {
  for(const [key,v] of this.values)if(v.expires<=now)this.values.delete(key);
  if(this.values.size>=1000)throw new AppError('SERVER_BUSY');
  const token=randomBytes(32).toString('base64url');this.values.set(token,{id,tableId,name,expires:now+60000});return token;
 }
 consume(token:unknown,tableId:string,now=Date.now()):Ticket {
  if(typeof token!=='string')throw new AppError('SESSION_EXPIRED');const value=this.values.get(token);
  this.values.delete(token);
  if(!value||value.tableId!==tableId||value.expires<=now)throw new AppError('SESSION_EXPIRED');return value;
 }
}
