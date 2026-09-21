import type{MaterializedWorld}from"@masterhost/domain";
import type{ActorRuntimeState}from"./index.js";

export function reconcileWorldLink(actor:ActorRuntimeState,template:{worldEntityKinds?:string[]},world:MaterializedWorld):ActorRuntimeState{
 if(actor.kind!=="npc"||!actor.worldEntityId)throw Error("actor has no World link");
 const entity=(actor.worldEntityPath?world.entities.find(value=>value.materializationPath===actor.worldEntityPath):undefined)??world.entities.find(value=>value.id===actor.worldEntityId);
 if(!entity)return{...actor,worldEntityRevision:world.revision,worldEntityStatus:"missing"};
 const status=template.worldEntityKinds?.includes(entity.kind)?"current"as const:"incompatible"as const;
 return{...actor,worldEntityId:entity.id,worldEntityPath:entity.materializationPath,worldEntityLabel:String(entity.values.name?.value??entity.kind),worldEntityRevision:world.revision,worldEntityStatus:status};
}
