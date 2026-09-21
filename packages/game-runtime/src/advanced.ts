export interface ExplorationNode{id:string;label:string;x:number;y:number;locationId?:string}
export interface ExplorationToken{actorId:string;nodeId:string}
export interface FogRegion{id:string;label:string;revealed:boolean;polygon:Array<[number,number]>}
export interface ExplorationBoard{id:string;sessionId:string;worldId:string;revision:number;nodes:ExplorationNode[];tokens:ExplorationToken[];fog:FogRegion[];updatedAt:string}
export interface PublicExplorationBoard extends Omit<ExplorationBoard,"fog">{fog:Array<Pick<FogRegion,"id"|"label"|"revealed">|FogRegion>}
export interface TimelineEvent{sequence:number;type:string;payload:any;createdAt:string}
export interface CampaignRecap{id:string;campaignId:string;provider:"deterministic";fromSequence:number;toSequence:number;entries:Array<{sequence:number;type:string;text:string;createdAt:string}>}
export interface CommunityPack{realmSlug:string;packId:string;version:string;name:string;description?:string;tags:string[];license?:string}
export interface RecapProvider{id:string;decorate(recap:CampaignRecap):Promise<CampaignRecap>}

export function visibleExplorationBoard(board:ExplorationBoard,gm:boolean):PublicExplorationBoard{
 if(gm)return board;
 const hidden=board.fog.filter(value=>!value.revealed),inside=(node:ExplorationNode,polygon:Array<[number,number]>)=>{let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i]!,b=polygon[j]!,cross=(a[1]>node.y)!==(b[1]>node.y)&&node.x<(b[0]-a[0])*(node.y-a[1])/(b[1]-a[1])+a[0];if(cross)hit=!hit}return hit},nodes=board.nodes.filter(node=>!hidden.some(region=>inside(node,region.polygon))),ids=new Set(nodes.map(node=>node.id));
 return{...board,nodes,tokens:board.tokens.filter(token=>ids.has(token.nodeId)),fog:board.fog.filter(value=>value.revealed).map(({id,label,revealed})=>({id,label,revealed}))};
}

const eventText=(event:TimelineEvent):string|undefined=>{
 const p=event.payload??{};
 if(event.type==="NarrativeEventRecorded")return String(p.text??"").trim()||undefined;
 if(event.type==="TravelCompleted"||event.type==="ActorMoved")return`Travelled to ${String(p.locationName??p.locationId??"a new location")}.`;
 if(event.type==="CheckResolved")return`Check resolved: ${String(p.outcome??"resolved")}.`;
 if(event.type==="ActionResolved")return`Action ${String(p.actionId??"resolved")} completed.`;
 if(event.type==="EncounterStarted")return"An encounter began.";
 if(event.type==="EncounterEnded")return"The encounter ended.";
 if(event.type==="CanonFactPromoted")return`Canon established: ${String(p.title??p.key??"new fact")}.`;
 return undefined;
};
export function buildCampaignRecap(campaignId:string,input:TimelineEvent[]):CampaignRecap{
 const events=[...input].sort((a,b)=>a.sequence-b.sequence),entries=events.flatMap(event=>{const text=eventText(event);return text?[{sequence:event.sequence,type:event.type,text,createdAt:event.createdAt}]:[]});
 return{id:`${campaignId}:${events.at(-1)?.sequence??0}`,campaignId,provider:"deterministic",fromSequence:events[0]?.sequence??0,toSequence:events.at(-1)?.sequence??0,entries};
}
export function filterCommunityCatalog(catalog:CommunityPack[],filter:{query?:string;tag?:string;license?:string}){
 const q=filter.query?.trim().toLowerCase(),tag=filter.tag?.trim().toLowerCase(),license=filter.license?.trim().toLowerCase();
 return catalog.filter(value=>(!q||[value.name,value.description,value.packId,value.realmSlug,...value.tags].some(text=>text?.toLowerCase().includes(q)))&&(!tag||value.tags.some(value=>value.toLowerCase()===tag))&&(!license||value.license?.toLowerCase()===license)).sort((a,b)=>a.name.localeCompare(b.name)||a.packId.localeCompare(b.packId));
}
export function redactSpectatorTimeline(events:TimelineEvent[]){
 const hidden=new Set<string>();for(const event of events)if(event.type==="CheckRequested"&&event.payload?.visibility!=="full")hidden.add(String(event.payload?.id??event.payload?.requestId??""));
 return events.filter(event=>{if(event.type==="CheckRequested")return event.payload?.visibility==="full";if(["DiceRolled","CheckResolved"].includes(event.type))return!hidden.has(String(event.payload?.requestId??""));return true});
}
