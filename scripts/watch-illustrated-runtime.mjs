import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

// Local preview only. Generation and final clean-installation acceptance remain separate.
if(!process.env.ARTWORK_REALM_TOKEN)throw Error('ARTWORK_REALM_TOKEN required');
const catalog=JSON.parse(fs.readFileSync('universe-catalog/catalog.json'));
const command=(file,args,options={})=>execFileSync(file,args,{...options});
const evidencePath=process.env.ARTWORK_EVIDENCE_PATH??'artwork/runtime-evidence.json';
const apiName='masterhost-illustrated-preview-api';
const webName='masterhost-illustrated-preview-web';
for(;;){
 const evidence=fs.existsSync(evidencePath)?JSON.parse(fs.readFileSync(evidencePath)):{results:[]};
 const pending=catalog.flatMap(universe=>{
  const path=`artwork/${universe.id}-integration.json`;
  if(!fs.existsSync(path))return [];
  const integration=JSON.parse(fs.readFileSync(path));
  return evidence.results.some(result=>result.universeId===universe.id&&result.assetVersion===integration.version)?[]:[universe];
 });
 if(pending.length){
  command('./node_modules/.bin/vitest',['run','tests/illustrated-universes.test.ts'],{stdio:'inherit'});
  const log=fs.openSync('/tmp/masterhost-art-api-build.log','w');
  try{command('docker',['build','--target','server','-t','masterhost-illustrated-demo-api:local','.'],{stdio:['ignore',log,log]});}finally{fs.closeSync(log);}
  // Reuse only this owned preview's existing environment; never print credentials.
  const environment=JSON.parse(command('docker',['inspect',apiName,'--format','{{json .Config.Env}}'],{encoding:'utf8'}));
  command('docker',['rm','-f',apiName],{stdio:'ignore'});
  command('docker',['run','-d','--name',apiName,'--restart','unless-stopped','--network','masterhost-collection-demo','--network-alias','illustrated-api','-p','127.0.0.1:8248:8080',...environment.flatMap(value=>['-e',value]),'masterhost-illustrated-demo-api:local'],{stdio:'ignore'});
  command('docker',['restart',webName],{stdio:'ignore'});
  for(const universe of pending)command(process.execPath,['scripts/verify-illustrated-runtime.mjs',universe.id],{stdio:'inherit'});
 }
 const latest=fs.existsSync(evidencePath)?JSON.parse(fs.readFileSync(evidencePath)):{results:[]};
 if(catalog.every(universe=>{
  const path=`artwork/${universe.id}-integration.json`;
  if(!fs.existsSync(path))return false;
  const integration=JSON.parse(fs.readFileSync(path));
  return latest.results.some(result=>result.universeId===universe.id&&result.assetVersion===integration.version);
 })){console.log('All twelve local preview runtime checks recorded; clean PostgreSQL, browser and visual review gates remain separate.');break;}
 await new Promise(resolve=>setTimeout(resolve,30000));
}
