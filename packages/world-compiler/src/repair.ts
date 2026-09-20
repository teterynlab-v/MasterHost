import type{MaterializedWorld}from"@masterhost/domain";import type{ConstraintSpec,ConstraintResult}from"./constraints.js";import type{WorldRelation}from"./relations.js";import{queryEntities}from"./relations.js";
export interface RepairAction{constraintId:string;action:string;details:string}
export function repairConstraints(world:MaterializedWorld,relations:WorldRelation[],specs:ConstraintSpec[],results:ConstraintResult[]){
 const actions:RepairAction[]=[];
 for(const failed of results.filter(x=>!x.passed)){const spec=specs.find(x=>x.id===failed.id);if(!spec)continue;
  if(spec.type==="relation-count"&&spec.min!==undefined&&failed.actual<spec.min){
   const entities=world.entities;if(entities.length<2)continue;let needed=spec.min-failed.actual;
   for(let i=0;i<entities.length&&needed>0;i++)for(let j=i+1;j<entities.length&&needed>0;j++){const a=entities[i]!,b=entities[j]!;if(relations.some(r=>r.type===spec.relation&&r.from===a.id&&r.to===b.id))continue;relations.push({id:`repair:${spec.id}:${a.id}:${b.id}`,from:a.id,type:spec.relation,to:b.id,source:"generated",sourceRef:`repair:${spec.id}`});needed--;actions.push({constraintId:spec.id,action:"add-relation",details:`${a.id} -${spec.relation}-> ${b.id}`})}
  }
  if(spec.type==="entity-count"){actions.push({constraintId:spec.id,action:"retry-required",details:"Entity-count repair requires template/generator regeneration; compiler should retry with a derived seed."})}
 }return actions;
}
