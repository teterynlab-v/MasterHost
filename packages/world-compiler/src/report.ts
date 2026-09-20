import type{MaterializedWorld}from"@masterhost/domain";import type{WorldRelation}from"./relations.js";import type{ConstraintResult}from"./constraints.js";
export function generationReport(world:MaterializedWorld,relations:WorldRelation[]=[],constraints:ConstraintResult[]=[]){
 const kinds=Object.fromEntries([...new Set(world.entities.map(e=>e.kind))].sort().map(k=>[k,world.entities.filter(e=>e.kind===k).length]));
 return{worldId:world.id,pack:`${world.packId}@${world.packVersion}`,seed:world.seed,entities:world.entities.length,kinds,relations:relations.length,constraints:{passed:constraints.filter(x=>x.passed).length,failed:constraints.filter(x=>!x.passed).length,results:constraints}};
}
export function explainValue(world:MaterializedWorld,entityId:string,key:string){
 const e=world.entities.find(x=>x.id===entityId);if(!e)throw Error(`entity not found ${entityId}`);const v=e.values[key];if(!v)throw Error(`value not found ${key}`);
 return{entity:{id:e.id,kind:e.kind,template:e.templateRef},property:key,value:v.value,source:v.source,sourceRef:v.sourceRef,locked:v.locked,pack:`${world.packId}@${world.packVersion}`,seed:world.seed};
}
