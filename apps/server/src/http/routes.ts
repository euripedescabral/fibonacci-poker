import type { IncomingMessage,ServerResponse } from 'node:http';
import { matchMaker } from '@colyseus/core';
import { z } from 'zod';
import { AppError,errorCode,nameSchema,PROTOCOL_VERSION } from '../../../../packages/contracts/src/index.js';
import type { Sessions } from '../identity/session.js';
import type { Tickets } from '../identity/tickets.js';
import type { TableStore } from '../storage/tables.js';
import type { Directory } from '../rooms/directory.js';
import { Limits } from './limits.js';
import { headers,origin,body,address } from './security.js';
import { serveStatic } from './static.js';
export interface HttpServices {sessions:Sessions;tickets:Tickets;store:TableStore;directory:Directory;origin:string;secure:boolean;staticRoot:string;ready:()=>boolean}
export function routes(s:HttpServices){const limits=new Limits();return async(req:IncomingMessage,res:ServerResponse):Promise<void>=>{
 headers(res);const send=(status:number,value:unknown)=>{res.writeHead(status,{'Content-Type':'application/json'}).end(JSON.stringify(value));};
 try{const path=new URL(req.url??'/',s.origin).pathname;
  if(req.method==='GET'&&path==='/health/live'){send(200,{ok:true});return;}
  if(req.method==='GET'&&path==='/health/ready'){s.store.db.prepare('SELECT 1').get();send(s.ready()?200:503,{ok:s.ready()});return;}
  if(!path.startsWith('/api/')){if(req.method==='GET'&&(path==='/'||path==='/privacy'||path.startsWith('/t/')||path.startsWith('/assets/')))await serveStatic(path,res,s.staticRoot);else send(404,{code:'INVALID_INPUT'});return;}
  if(!s.ready())throw new AppError('SERVER_RESTARTING');
  const ip=address(req);let input:Record<string,unknown>={};
  if(req.method==='POST'){origin(req,s.origin);input=await body(req);}
  if(path==='/api/session'&&req.method==='POST'){limits.take('session:'+ip,60,60000);const result=s.sessions.ensure(req.headers.cookie,s.secure);res.setHeader('Set-Cookie',result.cookie);send(200,{ok:true});return;}
  const id=s.sessions.read(req.headers.cookie);
  if(path==='/api/tables'&&req.method==='POST'){limits.take('create:'+id,10,3600000);limits.take('create-ip:'+ip,60,3600000);const table=s.store.create();send(201,{tableId:table.tableId,path:'/t/'+table.tableId});return;}
  const match=/^\/api\/tables\/([^/]+)(\/join)?$/.exec(path);if(!match||!z.uuid().safeParse(match[1]).success)throw new AppError('TABLE_NOT_FOUND');
  const tableId=match[1]!;const snapshot=s.store.load(tableId);
  if(req.method==='GET'&&!match[2]){send(200,{tableId,phase:snapshot.phase,suit:snapshot.suit,member:snapshot.members[id]?{name:snapshot.members[id]!.name}:null});return;}
  if(req.method==='POST'&&match[2]){limits.take('join:'+ip,60,60000);if(input.schemaVersion!==PROTOCOL_VERSION)throw new AppError('CLIENT_OUTDATED');const parsed=nameSchema.safeParse(input.name??snapshot.members[id]?.name);if(!parsed.success)throw new AppError('INVALID_INPUT');
   const room=await s.directory.wake(tableId);await (await s.directory.room(tableId)).reserveIdentity(id);const ticket=s.tickets.issue(id,tableId,parsed.data);const reservation=await matchMaker.reserveSeatFor(room,{ticket});send(200,{reservation,schemaVersion:PROTOCOL_VERSION,lastSequence:snapshot.members[id]?.lastSequence??0});return;}
  send(404,{code:'INVALID_INPUT'});
 }catch(error){const code=errorCode(error);send(code==='TABLE_NOT_FOUND'?404:code==='SESSION_EXPIRED'?401:code==='RATE_LIMITED'?429:code==='STORAGE_UNAVAILABLE'||code==='SERVER_BUSY'?503:400,{code});}
};}
