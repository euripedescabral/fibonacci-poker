import type Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
export function migrate(db:Database.Database):void {
 const sql=readFileSync(resolve('apps/server/src/storage/migrations/001-initial.sql'),'utf8');
 const checksum=createHash('sha256').update(sql).digest('hex');
 db.exec('CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, checksum TEXT NOT NULL, applied_at INTEGER NOT NULL)');
 const row=db.prepare('SELECT checksum FROM schema_migrations WHERE version=1').get() as {checksum:string}|undefined;
 if(row){if(row.checksum!==checksum)throw Error('Migration checksum mismatch');return;}
 db.transaction(()=>{db.exec(sql);db.prepare('INSERT INTO schema_migrations VALUES(1,?,?)').run(checksum,Date.now());}).immediate();
}
