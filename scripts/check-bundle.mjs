import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
const size=readdirSync('dist/web/assets').filter(f=>f.endsWith('.js')).reduce((n,f)=>n+gzipSync(readFileSync('dist/web/assets/'+f)).length,0);
if(size>200*1024)throw Error('JS gzip budget exceeded: '+size);
console.log('PASS JS gzip: '+size+' / 204800 bytes');
