import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import postgres from "postgres";

const base=process.env.MASTERHOST_API_URL??"http://localhost:8080/api",databaseUrl=process.env.MASTERHOST_DATABASE_URL;
if(!databaseUrl)throw Error("MASTERHOST_DATABASE_URL is required");
async function call(path,body,token,headers={}){const response=await fetch(`${base}${path}`,{method:body===undefined?"GET":"POST",headers:{...(body===undefined?{}:{"content-type":"application/json"}),...(token?{authorization:`Bearer ${token}`}:{}) ,...headers},body:body===undefined?undefined:JSON.stringify(body)});return{status:response.status,data:await response.json()}}
async function valid(path,body,token,headers){const result=await call(path,body,token,headers);assert.ok(result.status>=200&&result.status<300,`${path}: ${result.status} ${JSON.stringify(result.data)}`);return result.data}

const {manifest}=await valid("/pack"),creation=await valid("/character-creation"),fantasy=manifest.id.includes("fantasy"),ownerKey=randomUUID();
assert.equal(creation.schema.schemaVersion,"2");
const world=await valid("/worlds",{seed:`m2-${randomUUID()}`,choices:{}});
const exactCampaign=await valid("/campaigns",{worldId:world.id,name:"M2 exact",characterPortability:"exact"});
assert.equal(exactCampaign.characterPortability,"exact");
const exactSession=await valid(`/campaigns/${exactCampaign.id}/sessions`,{},exactCampaign.gmToken);
const first=await valid(`/sessions/${exactSession.id}/join`,{pin:exactSession.pin,displayName:"First player"});
const values=fantasy?{name:"Aria",archetype:"warrior",perception:2,athletics:3,portrait:"illustrated"}:{name:"Neon",role:"netrunner",interface:2,awareness:3,intrusionSuite:"ICE Breaker",portrait:"neon"};
const character=await valid("/characters",{ownerKey,values});
assert.equal(character.characterSchemaVersion,"2");
assert.equal(character.values[fantasy?"readiness":"edge"],5);
assert.deepEqual(character.progression,fantasy?{experience:0}:{streetCred:0});
assert.ok(character.inventory.length===1&&character.traits.length===1);
assert.ok(character.assets.portrait.endsWith("default-portrait.svg"));
const saved=await valid("/characters",undefined,undefined,{"x-owner-key":ownerKey});
assert.equal(saved.length,1);assert.deepEqual(saved[0].compatibility,{compatible:true,mode:"exact",reason:"exact Pack and character schema match",values:character.values});
await valid(`/participants/${first.id}/character`,{characterId:character.id,ownerKey},first.accessToken);
const returning=await valid(`/sessions/${exactSession.id}/join`,{pin:exactSession.pin,displayName:"Returning player"});
const reused=await valid(`/participants/${returning.id}/character`,{characterId:character.id,ownerKey},returning.accessToken);
assert.equal(reused.character.id,character.id);assert.equal(reused.compatibility.mode,"exact");

const sql=postgres(databaseUrl),legacyId=randomUUID(),legacyValues=fantasy?{name:"Legacy",archetype:"warrior",perception:1,athletics:2,obsolete:true}:{name:"Legacy",archetype:"solo",hacking:2,perception:1};
await sql`insert into characters(id,realm_id,world_pack_id,world_pack_version,character_schema_version,owner_key,display_name,values) values(${legacyId},${character.realmId},${manifest.id},'0.0.9','1',${ownerKey},'Legacy',${sql.json(legacyValues)})`;
await sql.end();
const withLegacy=await valid("/characters",undefined,undefined,{"x-owner-key":ownerKey}),legacy=withLegacy.find(value=>value.id===legacyId);
assert.equal(legacy.compatibility.compatible,true);assert.equal(legacy.compatibility.mode,fantasy?"normalize":"migrate");
const rejected=await call(`/participants/${first.id}/character`,{characterId:legacyId,ownerKey},first.accessToken);assert.equal(rejected.status,409);
const portableCampaign=await valid("/campaigns",{worldId:world.id,name:"M2 portable",characterPortability:"pack"}),portableSession=await valid(`/campaigns/${portableCampaign.id}/sessions`,{},portableCampaign.gmToken),portablePlayer=await valid(`/sessions/${portableSession.id}/join`,{pin:portableSession.pin,displayName:"Portable player"});
const ported=await valid(`/participants/${portablePlayer.id}/character`,{characterId:legacyId,ownerKey},portablePlayer.accessToken);
assert.equal(ported.compatibility.mode,fantasy?"normalize":"migrate");assert.notEqual(ported.character.id,legacyId);assert.equal(ported.character.worldPackVersion,manifest.version);assert.equal(ported.character.characterSchemaVersion,"2");assert.ok(ported.character.inventory.length===1&&ported.character.traits.length===1);
console.log(`M2 character smoke passed for ${manifest.id}: first create, exact reuse, ${ported.compatibility.mode} portability`);
