import type{FastifyInstance}from"fastify";import websocket from"@fastify/websocket";import{RuntimeRepository,GameRepository,ActorStateRepository,EncounterRepository,RuntimeMutationRepository,RuntimeReplayRepository,CheckRecoveryRepository}from"@masterhost/persistence";import type{WorldRepository}from"@masterhost/persistence";import{newCheckRequest,resolveCheck,initializeResources,effectiveModifier,executeAction,startEncounter,advanceEncounter,endEncounter}from"@masterhost/game-runtime";import type{CheckDefinition,ResourceDefinition,EffectDefinition}from"@masterhost/game-runtime";import{validateCharacterValues}from"@masterhost/worldpack-sdk";import type{LoadedWorldPack}from"@masterhost/worldpack-sdk";
import{createHash,randomUUID}from"node:crypto";
import { changeEncounterParticipants } from "@masterhost/game-runtime";
declare module "fastify" { interface FastifyInstance { masterhostPack?: LoadedWorldPack; masterhostWorldRepository?: WorldRepository } }
export async function registerRuntime(app:FastifyInstance,x:{db:string;realmId:string}){
 const pack=app.masterhostPack,worldRepository=app.masterhostWorldRepository;if(!pack||!worldRepository)throw Error("MasterHost dependencies unavailable");
 const repo=new RuntimeRepository(x.db),game=new GameRepository(x.db),actors=new ActorStateRepository(x.db),encounters=new EncounterRepository(x.db),mutations=new RuntimeMutationRepository(x.db),replay=new RuntimeReplayRepository(x.db),checkRecovery=new CheckRecoveryRepository(x.db);await game.migrate();await actors.migrate();await encounters.migrate();await mutations.migrate();await replay.migrate();await checkRecovery.migrate();await repo.migrate();await repo.ensureRealm(x.realmId);await app.register(websocket);
 const sockets=new Map<string,Set<{socket:any;participantId?:string;gm:boolean}>>();
 const snapshot=async(id:string)=>({session:await repo.session(id),participants:await repo.participants(id)});
 const broadcast=async(id:string,type:string,payload:any,participantId?:string)=>{const msg=JSON.stringify({type,sessionId:id,payload,at:new Date().toISOString()});for(const client of sockets.get(id)??[])if(client.socket.readyState===1&&(!participantId||client.gm||client.participantId===participantId))client.socket.send(msg)};
 const token=(req:any)=>String(req.headers.authorization??"").replace(/^Bearer\s+/i,"");
 const requireCampaignGm=async(req:any,id:string)=>{if(!await repo.verifyCampaignGm(id,token(req)))throw Object.assign(Error("GM authorization required"),{statusCode:403})};
 const requireSessionGm=async(req:any,id:string)=>{if(!await repo.verifySessionGm(id,token(req)))throw Object.assign(Error("GM authorization required"),{statusCode:403})};
 const requireParticipant=async(req:any,id:string)=>{if(!await repo.verifyParticipant(id,token(req)))throw Object.assign(Error("participant authorization required"),{statusCode:403})};
 const requireSessionMember=async(req:any,id:string)=>{if(!await repo.verifySessionGm(id,token(req))&&!await repo.sessionMember(id,token(req)))throw Object.assign(Error("session authorization required"),{statusCode:403})};
 const idempotency=async(req:any,sessionId:string)=>{const raw=req.headers["idempotency-key"];if(raw===undefined)return undefined;if(typeof raw!=="string"||!(/^[A-Za-z0-9._:-]{1,128}$/).test(raw))throw Object.assign(Error("invalid Idempotency-Key"),{statusCode:400});const fingerprint=createHash("sha256").update(`${req.method}\0${req.url}\0${JSON.stringify(req.body??{})}`).digest("hex");const prior=await mutations.receipt(sessionId,raw,fingerprint);return{key:raw,fingerprint,prior}};
 const sessionWorld=async(session:{campaignId:string;realmId:string})=>{const campaign=await repo.campaign(session.campaignId),world=campaign?await worldRepository.get(campaign.worldId):null;if(!campaign||!world||world.realmId!==session.realmId||world.packId!==pack.manifest.id||world.packVersion!==pack.manifest.version)throw Object.assign(Error("session World is unavailable or incompatible"),{statusCode:409});return world};
 app.post("/api/campaigns",async(req:any)=>{const world=await worldRepository.get(req.body?.worldId);if(!world||world.realmId!==x.realmId)throw Object.assign(Error("world not found in Realm"),{statusCode:404});if(world.packId!==pack.manifest.id||world.packVersion!==pack.manifest.version)throw Object.assign(Error("World Pack is not active for this Realm"),{statusCode:409});return repo.createCampaign({realmId:x.realmId,worldId:world.id,name:req.body.name??"New Campaign"})});
 app.get("/api/campaigns/:id",async(req:any)=>repo.campaign(req.params.id));
 app.post("/api/campaigns/:id/sessions",async(req:any)=>{const c=await repo.campaign(req.params.id);if(!c||c.realmId!==x.realmId)throw Object.assign(Error("campaign not found"),{statusCode:404});await requireCampaignGm(req,c.id);return repo.startLobby({realmId:x.realmId,campaignId:c.id,gmId:req.body?.gmId})});
 app.post("/api/join/resolve",async(req:any)=>{const s=await repo.resolvePin(x.realmId,String(req.body?.pin??""));if(!s)throw Object.assign(Error("PIN not found or expired"),{statusCode:404});return{session:s,campaign:await repo.campaign(s.campaignId)}});

 app.get("/api/character-creation",async()=>({pack:{id:pack.manifest.id,version:pack.manifest.version},schema:pack.content.characterCreation??{steps:[]}}));
 app.get("/api/characters",async(req:any)=>{const ownerKey=String(req.headers["x-owner-key"]??"");if(ownerKey.length<20)throw Object.assign(Error("owner key required"),{statusCode:403});return repo.characters(x.realmId,ownerKey,req.query?.packId,req.query?.packVersion)});
 app.post("/api/characters",async(req:any)=>{if(!pack)throw Error("pack unavailable");const ownerKey=String(req.body?.ownerKey??"");if(ownerKey.length<20)throw Object.assign(Error("owner key required"),{statusCode:400});const values=validateCharacterValues(pack.content.characterCreation??{steps:[]},req.body?.values),name=String(values.name??values.handle??req.body?.displayName??"Unnamed");return repo.createCharacter({realmId:x.realmId,packId:pack.manifest.id,packVersion:pack.manifest.version,ownerKey,displayName:name,values})});
 app.post("/api/participants/:id/character",async(req:any)=>{await requireParticipant(req,req.params.id);const participant=await repo.participant(req.params.id),c=await repo.character(req.body.characterId);if(!participant||!c)throw Object.assign(Error("participant or character not found"),{statusCode:404});const session=await repo.session(participant.sessionId);if(!session||session.realmId!==x.realmId||c.realmId!==x.realmId||c.worldPackId!==pack.manifest.id||c.worldPackVersion!==pack.manifest.version||!await repo.characterOwnedBy(c.id,String(req.body.ownerKey??"")))throw Object.assign(Error("character is not compatible or owned by this guest"),{statusCode:403});await repo.selectCharacter(req.params.id,c.id);return{ok:true,character:c}});

 app.post("/api/sessions/:id/join",async(req:any)=>{const p=await repo.joinGuest({sessionId:req.params.id,pin:String(req.body?.pin??""),displayName:String(req.body?.displayName??"Guest").trim().slice(0,80)||"Guest"});const{accessToken,...publicParticipant}=p;await broadcast(req.params.id,"participant.joined",publicParticipant);return p});
 app.get("/api/sessions/:id",async(req:any)=>{await requireSessionMember(req,req.params.id);return snapshot(req.params.id)});
 app.post("/api/sessions/:id/state",async(req:any)=>{await requireSessionGm(req,req.params.id);const s=await repo.transition(req.params.id,req.body.state);await broadcast(req.params.id,"session.state",s);return s});
 app.post("/api/participants/:id/ready",async(req:any)=>{await requireParticipant(req,req.params.id);const p=await repo.setReady(req.params.id,Boolean(req.body.ready));if(p)await broadcast(p.sessionId,"participant.ready",p);return p});
 app.post("/api/participants/:id/leave",async(req:any)=>{await requireParticipant(req,req.params.id);const sid=await repo.leave(req.params.id);if(sid){await broadcast(sid,"participant.left",{id:req.params.id});for(const client of sockets.get(sid)??[])if(client.participantId===req.params.id)client.socket.close(1008,"participant left")}return{ok:true}});


 app.get("/api/game/definitions",async()=>{const c=pack.content;return{checks:c.checks??{},resources:c.resources??{},effects:c.effects??{},actions:c.actions??{},actorTemplates:c.actorTemplates??{},encounter:c.encounter??{orderingPolicy:"none"}}});
 app.get("/api/sessions/:id/actors",async(req:any)=>{await requireSessionMember(req,req.params.id);return actors.all(req.params.id)});
 app.get("/api/sessions/:id/world-actors",async(req:any)=>{await requireSessionGm(req,req.params.id);const session=await repo.session(req.params.id);if(!session)throw Object.assign(Error("session not found"),{statusCode:404});const world=await sessionWorld(session),kinds=new Set(Object.values(pack.content.actorTemplates??{}).flatMap(template=>template.worldEntityKinds??[]));return world.entities.filter(entity=>kinds.has(entity.kind)).map(entity=>({id:entity.id,kind:entity.kind,name:String(entity.values.name?.value??entity.kind),materializationPath:entity.materializationPath}))});
 app.post("/api/sessions/:id/actors",async(req:any)=>{
  await requireSessionGm(req,req.params.id);
  const idem=await idempotency(req,req.params.id);if(idem?.prior!==undefined)return idem.prior;
  const session=await repo.session(req.params.id);if(!session||session.state!=="live")throw Object.assign(Error("session is not live"),{statusCode:409});
  const templateId=String(req.body?.templateId??""),template=pack.content.actorTemplates?.[templateId];if(!template)throw Object.assign(Error("unknown actor template"),{statusCode:400});
  const worldEntityId=req.body?.worldEntityId;
  if(worldEntityId!==undefined){
   if(typeof worldEntityId!=="string")throw Object.assign(Error("invalid World entity ID"),{statusCode:400});
   const world=await sessionWorld(session),entity=world.entities.find(item=>item.id===worldEntityId);
   if(!entity||!template.worldEntityKinds?.includes(entity.kind))throw Object.assign(Error("World entity is not compatible with actor template"),{statusCode:400});
  }
  const definitions=Object.fromEntries(Object.entries(pack.content.resources??{}).map(([id,value])=>[id,{id,...value}])) as Record<string,ResourceDefinition>;
  const state={actorId:randomUUID(),kind:"npc" as const,label:template.label,templateId,...(worldEntityId?{worldEntityId}:{}),attributes:template.attributes??{},resources:initializeResources(definitions,template.resources??{}),effects:[]};
  let receipt;
  try{receipt=await mutations.commit(session.id,[{type:"ActorInitialized",payload:{...state}}],[state],undefined,{},idem?{key:idem.key,fingerprint:idem.fingerprint,result:state}:undefined)}
  catch(error){if(error&&typeof error==="object"&&"constraint_name" in error&&error.constraint_name==="actor_one_world_entity_per_session")throw Object.assign(Error("World entity already has a session actor"),{statusCode:409});throw error}
  if(receipt.replayed)return receipt.result;
  await broadcast(session.id,"actor.state",state);return state;
 });
 app.post("/api/sessions/:id/actors/:actorId/edit",async(req:any)=>{
  await requireSessionGm(req,req.params.id);const idem=await idempotency(req,req.params.id);if(idem?.prior!==undefined)return idem.prior;
  const session=await repo.session(req.params.id);if(!session||session.state!=="live")throw Object.assign(Error("session is not live"),{statusCode:409});
  const versioned=await actors.allVersioned(session.id),row=versioned.find(value=>value.state.actorId===req.params.actorId),current=row?.state;if(!current)throw Object.assign(Error("actor not found"),{statusCode:404});if(current.kind!=="npc"||!current.templateId)throw Object.assign(Error("only NPC actors can be edited"),{statusCode:400});
  const template=pack.content.actorTemplates?.[current.templateId];if(!template)throw Object.assign(Error("NPC template is unavailable"),{statusCode:409});
  const label=req.body?.label===undefined?current.label:String(req.body.label).trim();if(!label||label.length>80)throw Object.assign(Error("NPC label must contain 1 to 80 characters"),{statusCode:400});
  const patch=req.body?.attributes??{};if(!patch||typeof patch!=="object"||Array.isArray(patch))throw Object.assign(Error("NPC attributes must be an object"),{statusCode:400});
  const allowed=new Set(Object.keys(template.attributes??{})),attributes={...(current.attributes??{})};for(const[key,value]of Object.entries(patch)){if(!allowed.has(key)||typeof value!=="number"||!Number.isFinite(value)||Math.abs(value)>1000)throw Object.assign(Error(`invalid NPC attribute ${key}`),{statusCode:400});attributes[key]=value}
  const next={...current,label,attributes},actorVersions=Object.fromEntries(versioned.map(value=>[value.state.actorId,value.version])),receipt=await mutations.commit(session.id,[{type:"ActorUpdated",payload:{actor:next}}],[next],undefined,{actorVersions},idem?{key:idem.key,fingerprint:idem.fingerprint,result:next}:undefined);if(receipt.replayed)return receipt.result;await broadcast(session.id,"actor.state",next);return next;
 });
 app.post("/api/sessions/:id/actors/:actorId/remove",async(req:any)=>{
  await requireSessionGm(req,req.params.id);const idem=await idempotency(req,req.params.id);if(idem?.prior!==undefined)return idem.prior;
  const session=await repo.session(req.params.id);if(!session||session.state!=="live")throw Object.assign(Error("session is not live"),{statusCode:409});
  const versioned=await actors.allVersioned(session.id),row=versioned.find(value=>value.state.actorId===req.params.actorId);if(!row)throw Object.assign(Error("actor not found"),{statusCode:404});if(row.state.kind!=="npc")throw Object.assign(Error("only NPC actors can be removed"),{statusCode:400});
  if((await encounters.forSession(session.id)).some(encounter=>encounter.state==="live"&&encounter.participants.includes(row.state.actorId)))throw Object.assign(Error("remove NPC from the active Encounter first"),{statusCode:409});
  const result={removedActorId:row.state.actorId},actorVersions=Object.fromEntries(versioned.map(value=>[value.state.actorId,value.version])),receipt=await mutations.commit(session.id,[{type:"ActorRemoved",payload:{actorId:row.state.actorId}}],[],undefined,{actorVersions,removeActorIds:[row.state.actorId]},idem?{key:idem.key,fingerprint:idem.fingerprint,result}:undefined);if(receipt.replayed)return receipt.result;await broadcast(session.id,"actor.removed",result);return result;
 });
 app.post("/api/sessions/:id/participants/:participantId/initialize",async(req:any)=>{await requireSessionGm(req,req.params.id);const idem=await idempotency(req,req.params.id);if(idem?.prior!==undefined)return idem.prior;const session=await repo.session(req.params.id);if(!session||session.state!=="live")throw Object.assign(Error("session is not live"),{statusCode:409});const p=await repo.participant(req.params.participantId);if(!p?.characterId||p.sessionId!==req.params.id)throw Object.assign(Error("participant has no character in session"),{statusCode:409});const c=await repo.character(p.characterId),defs=Object.fromEntries(Object.entries(pack.content.resources??{}).map(([id,value])=>[id,{id,...value}])) as Record<string,ResourceDefinition>,state={actorId:p.id,resources:initializeResources(defs,c?.values??{}),effects:[]};const receipt=await mutations.commit(req.params.id,[{type:"ActorInitialized",payload:{...state}}],[state],undefined,{},idem?{key:idem.key,fingerprint:idem.fingerprint,result:state}:undefined);if(receipt.replayed)return receipt.result;await broadcast(req.params.id,"actor.state",state);return state});
 app.post("/api/sessions/:id/actions",async(req:any)=>{
  await requireSessionGm(req,req.params.id);
  const idem=await idempotency(req,req.params.id);if(idem?.prior!==undefined)return idem.prior;
  const session=await repo.session(req.params.id);if(!session||session.state!=="live")throw Object.assign(Error("session is not live"),{statusCode:409});
  const defs=pack.content,action=defs.actions?.[req.body?.actionId];if(!action)throw Object.assign(Error("unknown action"),{statusCode:400});
  const actorId=String(req.body?.actorId??""),targetActorIds=Array.isArray(req.body?.targetActorIds)?req.body.targetActorIds:req.body?.targetActorId?[req.body.targetActorId]:[];
  const versioned=await actors.allVersioned(session.id),all=versioned.map(row=>row.state),actorVersions=Object.fromEntries(versioned.map(row=>[row.state.actorId,row.version])),actorMap=Object.fromEntries(all.map(state=>[state.actorId,state]));
  const characterValues:Record<string,Record<string,unknown>>={};for(const state of all){if(state.kind==="npc"){characterValues[state.actorId]=state.attributes??{};continue}const participant=await repo.participant(state.actorId);if(participant?.sessionId===session.id&&participant.characterId){const character=await repo.character(participant.characterId);if(character)characterValues[state.actorId]=character.values}}
  const checks=Object.fromEntries(Object.entries(defs.checks??{}).map(([id,value])=>[id,{id,...value as object}])) as Record<string,CheckDefinition>;
  const resources=Object.fromEntries(Object.entries(defs.resources??{}).map(([id,value])=>[id,{id,...value as object}])) as Record<string,ResourceDefinition>;
  const effects=Object.fromEntries(Object.entries(defs.effects??{}).map(([id,value])=>[id,{id,...value as object}])) as Record<string,EffectDefinition>;
  const result=executeAction({action:{id:req.body.actionId,...action},request:{sessionId:session.id,actionId:req.body.actionId,actorId,targetActorIds,inputs:req.body?.inputs},actors:actorMap,checks,resources,effects,characterValues});
  const receipt=await mutations.commit(session.id,result.events,result.states,undefined,{actorVersions},idem?{key:idem.key,fingerprint:idem.fingerprint,result}:undefined);
  if(receipt.replayed)return receipt.result;
  for(const state of result.states)await broadcast(session.id,"actor.state",state);
  await broadcast(session.id,"action.resolved",result.events.at(-1)?.payload);return result;
 });

 app.get("/api/game/checks",async()=>({checks:pack.content.checks??{}}));
 app.post("/api/sessions/:id/checks",async(req:any)=>{
  await requireSessionGm(req,req.params.id);
  const idem=await idempotency(req,req.params.id);if(idem?.prior!==undefined)return idem.prior;
  const session=await repo.session(req.params.id);if(!session||session.state!=="live")throw Object.assign(Error("session is not live"),{statusCode:409});
  const checks=pack.content.checks??{},def=checks[req.body.checkId];if(!def)throw Object.assign(Error("unknown check"),{statusCode:400});
  const participant=await repo.participant(req.body.participantId);if(!participant||participant.sessionId!==session.id)throw Object.assign(Error("participant not in session"),{statusCode:400});
  const c=newCheckRequest({sessionId:session.id,participantId:participant.id,checkId:req.body.checkId,difficulty:Number(req.body.difficulty),visibility:req.body.visibility??"full"});
  const created=await game.createCheck(c,idem?{key:idem.key,fingerprint:idem.fingerprint,result:c}:undefined);
  if(!created.replayed)await broadcast(session.id,"check.requested",created.request,participant.id);
  return created.request;
 });
 app.post("/api/checks/:id/roll",async(req:any)=>{const found=await game.check(req.params.id);if(!found)throw Object.assign(Error("check not found"),{statusCode:404});await requireParticipant(req,found.request.participantId);if(found.resolution)return found.resolution;const participant=await repo.participant(found.request.participantId);if(!participant?.characterId)throw Object.assign(Error("participant has no character"),{statusCode:409});const character=await repo.character(participant.characterId);if(!character)throw Error("character not found");const def=pack.content.checks?.[found.request.checkId];if(!def)throw Error("check definition unavailable");const state=await actors.get(found.request.sessionId,participant.id),effects=state?.effects??[],effectDefs=Object.fromEntries(Object.entries(pack.content.effects??{}).map(([id,value])=>[id,{id,...value}])) as Record<string,EffectDefinition>,field=def.modifierField,base=field?Number(character.values[field]??0):0,modified={...character.values,...(field?{[field]:effectiveModifier(base,field,effects,effectDefs)}:{})};const proposed=resolveCheck(found.request,{id:found.request.checkId,...def},modified);const{resolution,created}=await game.resolveCheck(found.request.id,proposed);if(created)await broadcast(found.request.sessionId,"check.resolved",{request:found.request,resolution},found.request.participantId);return resolution});
 app.get("/api/sessions/:id/events",async(req:any)=>{await requireSessionGm(req,req.params.id);return game.events(req.params.id)});
 app.get("/api/sessions/:id/runtime/verify",async(req:any)=>{await requireSessionGm(req,req.params.id);return replay.verify(req.params.id)});
 app.get("/api/sessions/:id/runtime/verify-checks",async(req:any)=>{await requireSessionGm(req,req.params.id);return checkRecovery.verify(req.params.id)});
 app.post("/api/sessions/:id/runtime/snapshots",async(req:any)=>{await requireSessionGm(req,req.params.id);return replay.createSnapshot(req.params.id)});
 app.get("/api/sessions/:id/runtime/verify-snapshot",async(req:any)=>{await requireSessionGm(req,req.params.id);return replay.verifyFromSnapshot(req.params.id)});
 app.get("/api/sessions/:id/participants/:participantId/checks",async(req:any)=>{await requireParticipant(req,req.params.participantId);const p=await repo.participant(req.params.participantId);if(p?.sessionId!==req.params.id)throw Object.assign(Error("participant not in session"),{statusCode:403});return game.pendingForParticipant(req.params.id,req.params.participantId)});

 app.get("/api/sessions/:id/encounters",async(req:any)=>{await requireSessionMember(req,req.params.id);return encounters.forSession(req.params.id)});
 app.post("/api/sessions/:id/encounters",async(req:any)=>{
  await requireSessionGm(req,req.params.id);
  const idem=await idempotency(req,req.params.id);if(idem?.prior!==undefined)return idem.prior;
  const session=await repo.session(req.params.id);if(!session||session.state!=="live")throw Object.assign(Error("session is not live"),{statusCode:409});
  const states=await actors.all(session.id),available=new Set(states.map(state=>state.actorId)),ids=req.body?.participantIds;
  if(!Array.isArray(ids)||ids.some(id=>typeof id!=="string"||!available.has(id)))throw Object.assign(Error("encounter participants must be initialized session actors"),{statusCode:400});
  const config=pack.content.encounter??{orderingPolicy:"none"};
  const attributes:Record<string,number>={};if(config.orderingPolicy==="attribute"){if(!config.attributeField)throw Error("encounter attribute field missing in Pack");for(const id of ids){const actor=states.find(state=>state.actorId===id);if(actor?.kind==="npc"){attributes[id]=Number(actor.attributes?.[config.attributeField]??NaN);continue}const participant=await repo.participant(id),character=participant?.characterId?await repo.character(participant.characterId):null;attributes[id]=Number(character?.values?.[config.attributeField]??NaN)}}
  const result=startEncounter({sessionId:session.id,participantIds:ids,policy:config.orderingPolicy,attributes,customOrder:req.body?.customOrder});
  const receipt=await mutations.commit(session.id,result.events,[],result.encounter,{},idem?{key:idem.key,fingerprint:idem.fingerprint,result}:undefined);if(receipt.replayed)return receipt.result;await broadcast(session.id,"encounter.state",result.encounter);return result;
 });
 app.post("/api/encounters/:id/participants",async(req:any)=>{
  const current=await encounters.getVersioned(req.params.id);if(!current)throw Object.assign(Error("encounter not found"),{statusCode:404});
  const encounter=current.encounter;await requireSessionGm(req,encounter.sessionId);
  const idem=await idempotency(req,encounter.sessionId);if(idem?.prior!==undefined)return idem.prior;
  const session=await repo.session(encounter.sessionId);if(!session||session.state!=="live")throw Object.assign(Error("session is not live"),{statusCode:409});
  const added=req.body?.addActorIds??[],removed=req.body?.removeActorIds??[];
  if(!Array.isArray(added)||!Array.isArray(removed)||[...added,...removed].some(id=>typeof id!=="string"))throw Object.assign(Error("actor ID lists are required"),{statusCode:400});
  const available=new Set((await actors.all(encounter.sessionId)).map(state=>state.actorId));
  if(added.some(id=>!available.has(id)))throw Object.assign(Error("added actors must be initialized in this Session"),{statusCode:400});
  const result=changeEncounterParticipants(encounter,{addActorIds:added,removeActorIds:removed});
  const receipt=await mutations.commit(encounter.sessionId,result.events,[],result.encounter,{encounterVersion:current.version},idem?{key:idem.key,fingerprint:idem.fingerprint,result}:undefined);
  if(receipt.replayed)return receipt.result;
  await broadcast(encounter.sessionId,"encounter.state",result.encounter);return result;
 });
 app.post("/api/encounters/:id/advance",async(req:any)=>{
  const current=await encounters.getVersioned(req.params.id);if(!current)throw Object.assign(Error("encounter not found"),{statusCode:404});
  const encounter=current.encounter;await requireSessionGm(req,encounter.sessionId);const idem=await idempotency(req,encounter.sessionId);if(idem?.prior!==undefined)return idem.prior;
  const versioned=await actors.allVersioned(encounter.sessionId),states=versioned.map(row=>row.state),actorVersions=Object.fromEntries(versioned.map(row=>[row.state.actorId,row.version])),defs=pack.content.effects??{};
  const effects=Object.fromEntries(Object.entries(defs).map(([id,value])=>[id,{id,...value as object}])) as Record<string,EffectDefinition>;
  const result=advanceEncounter(encounter,Object.fromEntries(states.map(state=>[state.actorId,state])),effects);
  const receipt=await mutations.commit(encounter.sessionId,result.events,result.states,result.encounter,{actorVersions,encounterVersion:current.version},idem?{key:idem.key,fingerprint:idem.fingerprint,result}:undefined);if(receipt.replayed)return receipt.result;await broadcast(encounter.sessionId,"encounter.state",result.encounter);return result;
 });
 app.post("/api/encounters/:id/end",async(req:any)=>{const current=await encounters.getVersioned(req.params.id);if(!current)throw Object.assign(Error("encounter not found"),{statusCode:404});const encounter=current.encounter;await requireSessionGm(req,encounter.sessionId);const idem=await idempotency(req,encounter.sessionId);if(idem?.prior!==undefined)return idem.prior;const result=endEncounter(encounter);const receipt=await mutations.commit(encounter.sessionId,result.events,[],result.encounter,{encounterVersion:current.version},idem?{key:idem.key,fingerprint:idem.fingerprint,result}:undefined);if(receipt.replayed)return receipt.result;await broadcast(encounter.sessionId,"encounter.state",result.encounter);return result});

 app.get("/ws/sessions/:id",{websocket:true},(socket:any,req:any)=>{const id=req.params.id;let client:{socket:any;participantId?:string;gm:boolean}|undefined;const timer=setTimeout(()=>socket.close(1008,"authentication timeout"),5000);socket.on("message",async(raw:Buffer)=>{if(client)return;try{const message=JSON.parse(raw.toString()),credential=String(message?.token??"");if(message?.type!=="authenticate"||!credential){socket.close(1008,"authorization required");return}const gm=await repo.verifySessionGm(id,credential),member=gm?null:await repo.sessionMember(id,credential);if(!gm&&!member){socket.close(1008,"authorization required");return}clearTimeout(timer);client={socket,gm,participantId:member?.id};let set=sockets.get(id);if(!set)sockets.set(id,set=new Set());set.add(client);socket.send(JSON.stringify({type:"session.snapshot",sessionId:id,payload:await snapshot(id),at:new Date().toISOString()}))}catch{socket.close(1008,"invalid authentication")}});socket.on("close",()=>{clearTimeout(timer);const set=sockets.get(id);if(client)set?.delete(client);if(set&&!set.size)sockets.delete(id)})});
}
