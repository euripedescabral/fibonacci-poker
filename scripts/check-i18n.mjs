import { pt } from '../apps/web/src/i18n/pt.ts';
import { en } from '../apps/web/src/i18n/en.ts';
if(JSON.stringify(Object.keys(pt).sort())!==JSON.stringify(Object.keys(en).sort()))throw Error('Locale keys differ');
console.log('PASS locale parity: '+Object.keys(en).length+' keys');
