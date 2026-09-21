import assert from "node:assert/strict";
import {readFile,writeFile} from "node:fs/promises";

const base=process.env.MASTERHOST_API_URL??"http://127.0.0.1:8091/api";
const peer=process.env.MASTERHOST_PEER_API_URL??"http://127.0.0.1:8092/api";
const platform=process.env.MASTERHOST_PLATFORM_KEY??"m7-platform";
const file=process.env.M7_STATE_FILE;
if(!file)throw Error("M7_STATE_FILE is required");
const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL3WQAAAABJRU5ErkJggg==","base64");

async function call(root,path,{method="GET",body,realm,token,headers={}}={}){
 const response=await fetch(`${root}${path}`,{method,headers:{...headers,...(realm?{"x-realm-slug":realm}:{}),...(token?{authorization:`Bearer ${token}`}:{}) ,...(body!==undefined&&!Buffer.isBuffer(body)?{"content-type":"application/json"}:{})},body:body===undefined?undefined:Buffer.isBuffer(body)?body:JSON.stringify(body)});
 const type=response.headers.get("content-type")??"",data=type.includes("json")?await response.json():type.startsWith("image/")||type.includes("octet-stream")?Buffer.from(await response.arrayBuffer()):await response.text();
 return{response,data};
}
async function ok(root,path,options){const result=await call(root,path,options);assert.ok(result.response.ok,`${options?.method??"GET"} ${path}: ${result.response.status} ${JSON.stringify(result.data)}`);return result.data}
const admin=(realm,token,extra={})=>({realm,token,...extra});

async function createRealm(slug,name,theme,terminology){
 const created=await ok(base,"/host/realms",{method:"POST",token:platform,body:{slug,name,brand:{theme,terminology},quotas:{worlds:3,packs:3,activeSessions:2,assetBytes:100000}}});
 const {realm,adminToken}=created;
 let project=await ok(base,"/pack-projects",admin(slug,adminToken,{method:"POST",body:{id:`masterhost.${slug}`,name:`${name} Pack`,version:"1.0.0",worldKind:`${slug}-realm`,worldName:`${name} Prime`,childKind:`${slug}-site`,childName:`${name} Site`}}));
 const validation=await ok(base,`/pack-projects/${project.id}/validate`,admin(slug,adminToken,{method:"POST"}));assert.equal(validation.valid,true);
 project=(await ok(base,`/pack-projects/${project.id}/publish`,admin(slug,adminToken,{method:"POST"}))).project;
 const configured=await ok(base,`/host/realms/${realm.id}`,admin(slug,adminToken,{method:"PUT",body:{activePack:{id:project.document.manifest.id,version:project.document.manifest.version},brand:{theme,terminology},quotas:{worlds:3,packs:3,activeSessions:2,assetBytes:100000}}}));
 const asset=await ok(base,`/host/realms/${realm.id}/assets/logo`,admin(slug,adminToken,{method:"POST",body:png,headers:{"content-type":"application/octet-stream","x-asset-media-type":"image/png"}}));
 const world=await ok(base,"/host/worlds/generate",admin(slug,adminToken,{method:"POST",body:{seed:`${slug}-m7`}}));
 return{realm:configured,adminToken,project,world,asset};
}

async function waitForMessage(url,token,action){
 const ws=new WebSocket(url);const events=[];
 try{return await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(`timed out waiting for cross-process realtime: ${events.join(",")}`)),7000);ws.addEventListener("open",()=>ws.send(JSON.stringify({type:"authenticate",token,afterSequence:0})));ws.addEventListener("message",async message=>{const event=JSON.parse(String(message.data));events.push(event.type);if(event.type==="session.snapshot")await action();if(event.type==="participant.joined"){clearTimeout(timer);resolve(event)}});ws.addEventListener("error",reject)})}finally{ws.close()}
}

if(process.env.M7_PHASE==="verify"){
 const saved=JSON.parse(await readFile(file,"utf8"));
 for(const item of [saved.ember,saved.neon]){
  const realm=await ok(base,"/host/realm",{realm:item.realm.slug});assert.equal(realm.id,item.realm.id);assert.equal(realm.name,item.realm.name);assert.equal(realm.activePack.id,item.project.document.manifest.id);
  const world=await ok(base,`/worlds/${item.world.id}`,admin(item.realm.slug,item.adminToken));assert.equal(world.realmId,item.realm.id);
  const resolved=await ok(base,"/join/resolve-global",{method:"POST",body:{pin:item.session.pin}});assert.equal(resolved.realm.slug,item.realm.slug);assert.equal(resolved.session.id,item.session.id);
 }
 console.log("M7 restart acceptance passed: both branded Realms, active Packs, Worlds and global session PINs survived restart.");
 process.exit(0);
}

const ember=await createRealm("ember-crown","Ember Crown",{primary:"#f26b38",accent:"#ffd166",background:"#26120f"},{world:"Dominion",character:"Vanguard",gameMaster:"Chronicler"});
const neon=await createRealm("neon-circuit","Neon Circuit",{primary:"#25e6d2",accent:"#ff4fcb",background:"#071522"},{world:"Grid",character:"Runner",gameMaster:"Operator"});
assert.notEqual(ember.realm.id,neon.realm.id);assert.notEqual(ember.project.document.manifest.id,neon.project.document.manifest.id);

await ok(base,`/host/realms/${ember.realm.id}/publications`,admin(ember.realm.slug,ember.adminToken,{method:"POST",body:{kind:"pack",resourceId:ember.project.id,visibility:"public",policies:{allowCampaigns:true,allowFork:true,allowModify:false,allowCharacters:true}}}));
await ok(base,`/host/realms/${ember.realm.id}/publications`,admin(ember.realm.slug,ember.adminToken,{method:"POST",body:{kind:"world",resourceId:ember.world.id,visibility:"public",policies:{allowCampaigns:true,allowFork:true,allowModify:false,allowCharacters:true}}}));
await ok(base,`/host/realms/${neon.realm.id}/publications`,admin(neon.realm.slug,neon.adminToken,{method:"POST",body:{kind:"pack",resourceId:neon.project.id,visibility:"public",policies:{allowCampaigns:true,allowFork:false,allowModify:false,allowCharacters:false}}}));
await ok(base,`/host/realms/${neon.realm.id}/publications`,admin(neon.realm.slug,neon.adminToken,{method:"POST",body:{kind:"world",resourceId:neon.world.id,visibility:"unlisted",policies:{allowCampaigns:true,allowFork:false,allowModify:false,allowCharacters:false}}}));

const emberCatalog=await ok(base,"/host/catalog",{realm:ember.realm.slug}),neonCatalog=await ok(base,"/host/catalog",{realm:neon.realm.slug});assert.equal(emberCatalog.length,2);assert.equal(neonCatalog.length,1);assert.equal(neonCatalog[0].kind,"pack");
assert.equal((await call(base,`/worlds/${ember.world.id}`,{realm:neon.realm.slug,token:neon.adminToken})).response.status,404);
assert.equal((await call(base,"/host/worlds/generate",{method:"POST",realm:ember.realm.slug,body:{seed:"anonymous"}})).response.status,403);
const directUnlisted=await ok(base,`/host/publications/world/${neon.world.id}`,{realm:neon.realm.slug});assert.equal(directUnlisted.visibility,"unlisted");

const gm=await ok(base,`/host/realms/${ember.realm.id}/members`,admin(ember.realm.slug,ember.adminToken,{method:"POST",body:{name:"Acceptance GM",role:"gm"}}));
const fork=await ok(base,`/host/worlds/${ember.world.id}/fork`,{method:"POST",realm:ember.realm.slug,token:gm.accessToken,body:{name:"Ember Fork"}});assert.equal(fork.realmId,ember.realm.id);
const neonGm=await ok(base,`/host/realms/${neon.realm.id}/members`,admin(neon.realm.slug,neon.adminToken,{method:"POST",body:{name:"Neon GM",role:"gm"}}));
assert.equal((await call(base,`/host/worlds/${neon.world.id}/fork`,{method:"POST",realm:neon.realm.slug,token:neonGm.accessToken,body:{name:"Denied"}})).response.status,403);
assert.equal((await call(base,`/worlds/${neon.world.id}/fork`,{method:"POST",realm:neon.realm.slug,token:neonGm.accessToken,body:{name:"Still Denied"}})).response.status,403);
assert.equal((await call(base,"/campaigns",{method:"POST",realm:ember.realm.slug,body:{worldId:ember.world.id,name:"Anonymous Bypass"}})).response.status,403);

const emberCampaign=await ok(base,"/host/campaigns",{method:"POST",realm:ember.realm.slug,token:gm.accessToken,body:{worldId:ember.world.id,name:"Ember Chronicle",characterPortability:"pack"}});
const emberSession=await ok(base,`/host/campaigns/${emberCampaign.id}/sessions`,{method:"POST",realm:ember.realm.slug,token:emberCampaign.gmToken});assert.match(emberSession.pin,/^\d{6}$/);
const neonCampaign=await ok(base,"/host/campaigns",{method:"POST",realm:neon.realm.slug,token:neonGm.accessToken,body:{worldId:neon.world.id,name:"Neon Run",characterPortability:"exact"}});
const neonSession=await ok(base,`/host/campaigns/${neonCampaign.id}/sessions`,{method:"POST",realm:neon.realm.slug,token:neonCampaign.gmToken});assert.match(neonSession.pin,/^\d{6}$/);assert.notEqual(emberSession.pin,neonSession.pin);
for(const [item,session] of [[ember,emberSession],[neon,neonSession]]){const resolved=await ok(base,"/join/resolve-global",{method:"POST",body:{pin:session.pin}});assert.equal(resolved.realm.slug,item.realm.slug);assert.equal(resolved.realm.brand.theme.primary,item.realm.brand.theme.primary)}

const wsUrl=peer.replace(/^http/,"ws").replace(/\/api$/,`/ws/sessions/${emberSession.id}`);
const joined=await waitForMessage(wsUrl,emberCampaign.gmToken,()=>ok(base,`/sessions/${emberSession.id}/join`,{method:"POST",realm:ember.realm.slug,body:{pin:emberSession.pin,displayName:"Cross Node Player"}}));assert.equal(joined.payload.displayName,"Cross Node Player");

const cdn=await call(peer,`/cdn/${ember.asset.checksum}`);assert.equal(cdn.response.status,200);assert.equal(cdn.response.headers.get("cache-control"),"public, max-age=31536000, immutable");assert.deepEqual(cdn.data,png);
await ok(base,`/host/realms/${ember.realm.id}`,admin(ember.realm.slug,ember.adminToken,{method:"PUT",body:{quotas:{worlds:2}}}));
assert.equal((await call(base,"/host/worlds/generate",admin(ember.realm.slug,ember.adminToken,{method:"POST",body:{seed:"over-quota"}}))).response.status,429);
const usage=await ok(base,`/host/realms/${ember.realm.id}/usage`,admin(ember.realm.slug,ember.adminToken));assert.equal(usage.usage.worlds,2);assert.equal(usage.quotas.worlds,2);
const telemetry=await ok(base,`/host/realms/${ember.realm.id}/telemetry`,admin(ember.realm.slug,ember.adminToken));assert.ok(telemetry.some(value=>value.event==="world.generated"));assert.ok(telemetry.some(value=>value.event==="session.started"));

const backup=await ok(base,`/host/realms/${ember.realm.id}/backups`,admin(ember.realm.slug,ember.adminToken,{method:"POST"}));assert.equal(backup.counts.worlds,2);assert.equal(backup.counts.packs,1);
await ok(base,`/host/realms/${ember.realm.id}`,admin(ember.realm.slug,ember.adminToken,{method:"PUT",body:{name:"Temporary Name",brand:{theme:{primary:"#000000"}}}}));
await ok(base,`/host/realms/${ember.realm.id}/backups/${backup.id}/restore`,admin(ember.realm.slug,ember.adminToken,{method:"POST"}));
const restored=await ok(base,"/host/realm",{realm:ember.realm.slug});assert.equal(restored.name,"Ember Crown");assert.equal(restored.brand.theme.primary,"#f26b38");

ember.session=emberSession;neon.session=neonSession;await writeFile(file,JSON.stringify({ember,neon}));
console.log("M7 live acceptance passed: two branded isolated Realms, publication policy, global PINs, cross-process realtime, CDN, quotas, telemetry and verified restore.");
