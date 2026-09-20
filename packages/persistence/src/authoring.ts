import type{MaterializedWorld}from"@masterhost/domain";import{createRevision,type WorldRevision}from"./revisions.js";
export interface AuthoringResult{world:MaterializedWorld;revision:WorldRevision}
export function authoringTransaction(x:{world:MaterializedWorld;actor?:string;operation:string;summary?:string;mutate:(draft:MaterializedWorld)=>void}):AuthoringResult{
 const before=structuredClone(x.world),draft=structuredClone(x.world);x.mutate(draft);draft.revision=before.revision+1;draft.updatedAt=new Date().toISOString();
 const changes=diffWorld(before,draft);return{world:draft,revision:createRevision({worldId:draft.id,number:draft.revision,actor:x.actor,operation:x.operation,summary:x.summary,changes})};
}
export function diffWorld(a:MaterializedWorld,b:MaterializedWorld){
 const aa=new Map(a.entities.filter(e=>e.materializationPath).map(e=>[e.materializationPath!,e])),bb=new Map(b.entities.filter(e=>e.materializationPath).map(e=>[e.materializationPath!,e]));
 const created=[...bb.keys()].filter(k=>!aa.has(k)),removed=[...aa.keys()].filter(k=>!bb.has(k)),changed:any[]=[];
 for(const[k,be]of bb){const ae=aa.get(k);if(!ae)continue;for(const key of new Set([...Object.keys(ae.values),...Object.keys(be.values)])){const av=ae.values[key],bv=be.values[key];if(JSON.stringify(av)!==JSON.stringify(bv))changed.push({path:k,key,before:av??null,after:bv??null})}}
 return{created,removed,changed};
}
