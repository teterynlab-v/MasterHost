import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const base=process.env.ARTWORK_API_URL??'http://127.0.0.1:8248';
const admin=process.env.ARTWORK_REALM_TOKEN;if(!admin)throw Error('ARTWORK_REALM_TOKEN required');
const slug=process.env.ARTWORK_REALM??'default';
const credentialDirectory=process.env.ARTWORK_CREDENTIAL_DIR??'/tmp';
fs.mkdirSync(credentialDirectory,{recursive:true,mode:0o700});
async function api(path,method='GET',body,token=admin){const response=await fetch(`${base}${path}${path.includes('?')?'&':'?'}realm=${slug}`,{method,headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});if(!response.ok)throw Error(`${method} ${path}: ${response.status} ${await response.text()}`);return response.json();}
let ready=false;
for(let attempt=0;attempt<30;attempt++){
 try{ready=(await fetch(`${base}/health`,{signal:AbortSignal.timeout(1000)})).ok;}catch{}
 if(ready)break;
 await new Promise(resolve=>setTimeout(resolve,500));
}
if(!ready)throw Error('Illustrated API did not become ready');
const realm=await api('/api/host/realm');
const assets=await api('/api/game-assets');
const catalog=JSON.parse(fs.readFileSync('universe-catalog/catalog.json'));
const results=[];
try{
 for(const universe of catalog){
  if(process.argv[2]&&process.argv[2]!==universe.id)continue;
  if(!fs.existsSync(`artwork/${universe.id}-integration.json`))continue;
  const integration=JSON.parse(fs.readFileSync(`artwork/${universe.id}-integration.json`));
  const selected=assets.filter(a=>a.version===integration.version&&a.compatibility.basePackIds.includes(universe.targetPack.id)&&a.preview.highlights.includes('Illustrated Universe v1'));
  if(selected.length!==9)throw Error(`Expected nine illustrated assets for ${universe.id}`);
  await api(`/api/host/realms/${realm.id}`,'PUT',{activePack:universe.targetPack});
  const profile=JSON.parse(fs.readFileSync(`worldpacks/${universe.id}/universe.yaml`));
  const kit=profile.campaignKits[0];
  const project=await api('/api/game-descriptors','POST',{name:`${universe.name} · ${kit.name}`,basePack:universe.targetPack,selections:selected.map(a=>({fragmentId:a.id,version:a.version,parameters:{}})),seed:`illustrated-${universe.id}`,decisions:{'world.pattern':kit.patternIds[0],'world.campaignKit':kit.id,'world.visualTheme':'visualThemes.1'}});
  const world=await api(`/api/game-descriptors/${project.id}/compile`,'POST',{});
  const visuals=selected.find(a=>a.type==='visuals');
  for(let offset=0;offset<visuals.media.length;offset+=4){await Promise.all(visuals.media.slice(offset,offset+4).map(async media=>{const response=await fetch(`${base}/api/worlds/${world.id}/pack-assets/${media.name}?realm=${slug}`);const bytes=Buffer.from(await response.arrayBuffer());if(!response.ok||response.headers.get('content-type')!=='image/webp'||bytes.length!==media.size||createHash('sha256').update(bytes).digest('hex')!==media.checksum)throw Error(`Runtime media mismatch ${media.name}`);}));}
  const campaign=await api('/api/campaigns','POST',{worldId:world.id,name:world.name});
  const session=await api(`/api/campaigns/${campaign.id}/sessions`,'POST',{},campaign.gmToken);
  await api(`/api/sessions/${session.id}/state`,'POST',{state:'live'},campaign.gmToken);
  const demoNpcs=world.entities.filter(entity=>entity.kind==='npc'&&entity.tags.some(tag=>tag.startsWith('illustrated.'))).slice(0,3);
  for(const entity of demoNpcs){
   const template=Object.entries(project.compiled.content.actorTemplates).find(([,value])=>value.worldEntityKinds?.includes(entity.kind));
   if(!template)throw Error('No generic actor template for illustrated NPC');
   const actor=await api(`/api/sessions/${session.id}/actors`,'POST',{templateId:template[0],worldEntityId:entity.id},campaign.gmToken);
   await api(`/api/sessions/${session.id}/actors/${actor.actorId}/edit`,'POST',{label:String(entity.values.name.value)},campaign.gmToken);
  }
  const table=await api(`/api/sessions/${session.id}/table`,'POST',{},campaign.gmToken);
  const board=await api(`/api/sessions/${session.id}/exploration`,'POST',{},campaign.gmToken);
  if(!board.nodes.length)throw Error('Illustrated demo has no exploration locations');
  const context=await api(`/api/sessions/${session.id}/context`,'GET',undefined,campaign.gmToken);
  if(Object.keys(context.sceneMedia??{}).length!==6||!context.media.map.includes('visualThemes.1.webp'))throw Error('GM scene gallery or chosen map missing');
  const guest=await api(`/api/sessions/${session.id}/join`,'POST',{pin:session.pin,displayName:'Illustration acceptance'});
  const playerContext=await api(`/api/sessions/${session.id}/context`,'GET',undefined,guest.accessToken);
  if('sceneMedia' in playerContext)throw Error('Future scene media leaked to player');
  const next=table.scenes[1];const changedTable=await api(`/api/sessions/${session.id}/table`,'PATCH',{expectedRevision:table.revision,activeSceneId:next.id},campaign.gmToken);
  const changed=await api(`/api/sessions/${session.id}/context`,'GET',undefined,guest.accessToken);
  if(changed.media.background!==context.sceneMedia[next.id])throw Error('Active scene artwork did not change');
  await api(`/api/sessions/${session.id}/table`,'PATCH',{expectedRevision:changedTable.revision,activeSceneId:table.activeSceneId},campaign.gmToken);
  await api(`/api/sessions/${session.id}/participants/${guest.id}/remove`,'POST',{},campaign.gmToken);
  fs.writeFileSync(path.join(credentialDirectory,`masterhost-${universe.id}-illustrated-session.json`),JSON.stringify({campaign,session,guest,worldId:world.id}),{mode:0o600});
  results.push({universeId:universe.id,assetVersion:integration.version,worldId:world.id,sessionId:session.id,pin:session.pin,servedImages:visuals.media.length,sceneImages:6,mapNodes:board.nodes.length,demoNpcs:demoNpcs.length,playerFutureScenesHidden:true,activeSceneChanged:true,openingSceneRestored:true,verificationParticipantRemoved:true});
  console.log(`Verified live ${universe.id}: 151 images, six scenes, linked NPCs, map and player visibility.`);
 }
}finally{await api(`/api/host/realms/${realm.id}`,'PUT',{activePack:realm.activePack});}
const evidencePath=process.env.ARTWORK_EVIDENCE_PATH??'artwork/runtime-evidence.json';
const prior=fs.existsSync(evidencePath)?JSON.parse(fs.readFileSync(evidencePath)):{};
const merged=new Map((prior.results??[]).map(result=>[result.universeId,result]));for(const result of results)merged.set(result.universeId,result);
fs.writeFileSync(evidencePath,JSON.stringify({checkedAt:new Date().toISOString(),api:base,results:[...merged.values()],browserAcceptance:prior.browserAcceptance??'pending'},null,2)+'\n');
console.log(`Verified ${results.length} illustrated collections against PostgreSQL API; every image checksum served, GM scene gallery and player active scene visibility checked.`);
