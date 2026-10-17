export const tablePhases=["setup","exploration","social","encounter","reward","epilogue"] as const;
export type TablePhase=typeof tablePhases[number];
export type TableSceneStatus="upcoming"|"active"|"complete";
export interface TableScene{id:string;title:string;summary?:string;sourceEntityId?:string;status:TableSceneStatus}
export interface TablePrivateNoteImage{checksum:string;mediaType:string;size:number;name:string}
export interface TablePrivateNote{id:string;text:string;image?:TablePrivateNoteImage}
export interface TableState{sessionId:string;revision:number;phase:TablePhase;activeSceneId?:string;scenes:TableScene[];sharedNotes:string[];privateNotes:string[];privateNoteEntries?:TablePrivateNote[];updatedAt:string}
export type PublicTableState=Omit<TableState,"privateNotes"|"privateNoteEntries">;
export interface TableEvent{type:string;payload?:Record<string,unknown>}
export interface RehearsalStage{passed:boolean;count:number}
export interface RehearsalReport{sessionId:string;gatePassed:boolean;stages:{setup:RehearsalStage;characterCreation:RehearsalStage;exploration:RehearsalStage;socialInteraction:RehearsalStage;encounter:RehearsalStage;rewards:RehearsalStage;progression:RehearsalStage;reconnection:RehearsalStage;completion:RehearsalStage};missing:string[]}

export function createTableState(input:{sessionId:string;scenes:Array<Omit<TableScene,"status">>}):TableState{
 const scenes=input.scenes.map((scene,index)=>({...scene,status:index===0?"active" as const:"upcoming" as const}));
 return{sessionId:input.sessionId,revision:1,phase:"setup",activeSceneId:scenes[0]?.id,scenes,sharedNotes:[],privateNotes:[],updatedAt:new Date().toISOString()};
}

export function visibleTableState(table:TableState,gm:boolean):TableState|PublicTableState{
 if(gm)return structuredClone(table);
 const{privateNotes:_,privateNoteEntries:__,...visible}=structuredClone(table);return visible;
}

export function isTablePhase(value:unknown):value is TablePhase{return typeof value==="string"&&(tablePhases as readonly string[]).includes(value)}

export function assertActorControl(input:{gm:boolean;participantId?:string;actorId:string}){
 if(!input.gm&&(!input.participantId||input.participantId!==input.actorId))throw Object.assign(Error("actor control forbidden"),{statusCode:403});
}

export function buildRehearsalReport(input:{sessionId:string;sessionState:string;participants:Array<{id:string;characterId?:string}>;actors:Array<{actorId:string}>;events:TableEvent[]}):RehearsalReport{
 const count=(type:string)=>input.events.filter(event=>event.type===type).length;
 const social=input.events.filter(event=>event.type==="TableBeatRecorded"&&event.payload?.phase==="social").length;
 const explored=count("ExplorationTokenMoved")+count("FogRegionChanged")+count("ActorMoved")+input.events.filter(event=>event.type==="TableBeatRecorded"&&event.payload?.phase==="exploration").length;
 const characterCount=input.participants.filter(participant=>participant.characterId).length;
 const actorIds=new Set(input.actors.map(actor=>actor.actorId));
 const initializedCharacters=input.participants.filter(participant=>participant.characterId&&actorIds.has(participant.id)).length;
 const stages={
  setup:{passed:count("TableStarted")>0&&count("ActorInitialized")>0,count:Math.min(count("TableStarted"),count("ActorInitialized"))},
  characterCreation:{passed:input.participants.length>0&&characterCount===input.participants.length&&initializedCharacters===input.participants.length,count:initializedCharacters},
  exploration:{passed:count("ExplorationStarted")>0&&explored>0,count:explored},
  socialInteraction:{passed:social>0,count:social},
  encounter:{passed:count("EncounterStarted")>0&&count("EncounterEnded")>0,count:Math.min(count("EncounterStarted"),count("EncounterEnded"))},
  rewards:{passed:count("ItemGranted")>0,count:count("ItemGranted")},
  progression:{passed:count("ProgressionChanged")>0,count:count("ProgressionChanged")},
  reconnection:{passed:count("SessionReconnected")>0,count:count("SessionReconnected")},
  completion:{passed:input.sessionState==="finished",count:input.sessionState==="finished"?1:0},
 };
 const missing=Object.entries(stages).filter(([,stage])=>!stage.passed).map(([name])=>name);
 return{sessionId:input.sessionId,stages,missing,gatePassed:missing.length===0};
}

/** Legacy IDs remain deterministic until the first mutation saves structured entries. */
export function normalizeTablePrivateNotes(table:TableState){
 table.privateNoteEntries??=table.privateNotes.map((text,index)=>({id:`legacy-${index}`,text}));
 table.privateNotes=table.privateNoteEntries.map(note=>note.text);
 return table.privateNoteEntries;
}
export type TablePrivateNoteMutation={kind:"add"|"edit";id:string;text:string;image?:TablePrivateNoteImage|null}|{kind:"delete";id:string};
export function mutateTablePrivateNote(table:TableState,mutation:TablePrivateNoteMutation){
 const entries=normalizeTablePrivateNotes(table),index=entries.findIndex(note=>note.id===mutation.id);
 if(mutation.kind!=="add"&&index<0)throw Object.assign(Error("private note not found"),{statusCode:404});
 if(mutation.kind==="delete")entries.splice(index,1);
 else{
  const image=mutation.image===undefined&&mutation.kind==="edit"?entries[index]?.image:mutation.image??undefined;
  const text=mutation.text.trim();
  if(text.length>2000||!text&&!image)throw Object.assign(Error("note requires text or image"),{statusCode:400});
  const note={id:mutation.id,text,...(image?{image}:{})};
  if(mutation.kind==="add"){
   if(index>=0)throw Object.assign(Error("private note already exists"),{statusCode:409});
   if(entries.length>=100)throw Object.assign(Error("private note limit reached"),{statusCode:400});
   entries.push(note);
  }else entries[index]=note;
 }
 table.privateNotes=entries.map(note=>note.text);
}
