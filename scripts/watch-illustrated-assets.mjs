import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const catalog=JSON.parse(fs.readFileSync('universe-catalog/catalog.json'));
// This watches local source outputs only; image generation remains in the built-in tool.
for(;;){
 const inventory=JSON.parse(fs.readFileSync('artwork/manifest.json'));
 for(const universe of catalog){
  if(fs.existsSync(`artwork/${universe.id}-integration.json`))continue;
  const entries=inventory.entries.filter(entry=>entry.universeId===universe.id);
  if(entries.length===151&&entries.every(entry=>entry.status==='generated')){
   execFileSync(process.execPath,['scripts/build-illustrated-assets.mjs',universe.id],{stdio:'inherit'});
  }
 }
 const remaining=catalog.filter(universe=>!fs.existsSync(`artwork/${universe.id}-integration.json`));
 if(!remaining.length){console.log('All twelve collections assembled; runtime/browser acceptance remains separate.');break;}
 await new Promise(resolve=>setTimeout(resolve,30000));
}
