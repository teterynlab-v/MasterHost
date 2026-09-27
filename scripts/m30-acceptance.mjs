import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const base=process.env.MASTERHOST_API_URL,dir=process.env.M30_PROOF_DIR,phase=process.env.M30_PHASE;
if(!base||!dir||!phase)throw Error('M30 API/proof/phase required');
const headers={'x-realm-slug':'default',authorization:'Bearer local-default-realm-admin'};
async function call(path,method='GET',body,binary=false){const r=await fetch(base+path,{method,headers:{...headers,...(body===undefined?{}:{'content-type':binary?'application/vnd.masterhost.game+zip':'application/json'})},body:body===undefined?undefined:binary?body:JSON.stringify(body)});const bytes=new Uint8Array(await r.arrayBuffer());assert.ok(r.ok,`${method} ${path}: ${r.status} ${new TextDecoder().decode(bytes)}`);return r.headers.get('content-type')?.includes('json')?JSON.parse(new TextDecoder().decode(bytes)):bytes}
const canonical=w=>JSON.parse(JSON.stringify({seed:w.seed,packId:w.packId,packVersion:w.packVersion,descriptor:w.descriptor,entities:w.entities.map(e=>({path:e.materializationPath,kind:e.kind,values:e.values,tags:e.tags,traits:e.traits,assets:e.assets}))}));
if(phase==='export'){
 await mkdir(dir,{recursive:true});const entries=await call('/universes');assert.equal(entries.length,12);assert.ok(entries.every(e=>e.availability==='ready'));const evidence=[];
 for(const entry of entries){
  await call('/host/realms/00000000-0000-0000-0000-000000000001','PUT',{activePack:entry.targetPack});
  const assets=(await call(`/game-assets?basePackId=${entry.targetPack.id}`)).filter(a=>a.preview.highlights.includes('Deep Universe Standard v1'));assert.equal(assets.length,9);
  const review=await call('/game-assets/quick-review','POST',{basePack:entry.targetPack,selections:assets.map(a=>({id:a.id,version:a.version}))});assert.equal(review.ready,true);
  const selections=review.orderedSelections.map(a=>({fragmentId:a.id,version:a.version,parameters:{}}));
  for(const [index,pattern]of entry.patterns.entries()){
   const decisions={'world.pattern':pattern.id,'world.campaignKit':`kit.${pattern.id}`,'world.visualTheme':`visualThemes.${index+1}`};
   const project=await call('/game-descriptors','POST',{name:`M30 ${entry.name} ${pattern.name}`,seed:`m30-${entry.id}-${pattern.id}`,basePack:entry.targetPack,selections,decisions,locks:[]});
   const world=await call(`/game-descriptors/${project.id}/compile`,'POST');assert.equal(world.entities.filter(e=>e.kind==='scene').length,6);
   if(index===0){const archive=await call(`/worlds/${world.id}/export-game`);await writeFile(`${dir}/${entry.id}.mhgame`,archive);evidence.push({universe:entry.id,canonical:canonical(world)});}
  }
 }
 await writeFile(`${dir}/collection.json`,JSON.stringify(evidence));console.log('M30 A:12 exact ready Packs; all36 Quick/Advanced Kit Worlds compiled;12 portable archives exported.');
}else if(phase==='import'){
 const evidence=JSON.parse(await readFile(`${dir}/collection.json`,'utf8'));
 for(const entry of evidence){const imported=await call('/games/import','POST',await readFile(`${dir}/${entry.universe}.mhgame`),true);entry.installed=imported;assert.deepEqual(canonical(await call(`/worlds/${imported.worldId}`)),entry.canonical);}
 await writeFile(`${dir}/collection.json`,JSON.stringify(evidence));console.log('M30 B:12 self-contained universe games imported with exact Pack/Descriptor/World evidence.');
}else if(phase==='verify'){
 for(const entry of JSON.parse(await readFile(`${dir}/collection.json`,'utf8')))assert.deepEqual(canonical(await call(`/worlds/${entry.installed.worldId}`)),entry.canonical);
 const entries=await call('/universes');assert.equal(entries.length,12);assert.ok(entries.every(e=>e.availability==='ready'));console.log('M30 restart:all12 imported Worlds and exact official collection survived.');
}else throw Error('Unknown M30 phase');
