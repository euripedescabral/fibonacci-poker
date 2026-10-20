import { it,expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { harness } from './harness.js';
it('serves health and requires session; unknown tables never create',async()=>{const h=await harness();try{expect((await fetch(h.url+'/health/ready')).status).toBe(200);expect((await h.request('/api/tables','',{})).status).toBe(401);const cookie=await h.identity();expect((await h.request('/api/tables/'+randomUUID(),cookie)).status).toBe(404);const id=await h.create(cookie);expect((await h.request('/api/tables/'+id+'/join',cookie,{name:'A',schemaVersion:0})).status).toBe(400);}finally{await h.close();}});
