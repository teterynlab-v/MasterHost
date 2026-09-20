import{createHash}from"node:crypto";import type{MaterializedWorld,WorldEntity}from"@masterhost/domain";import{queryEntities,type EntityQuery,type WorldRelation}from"./relations.js";
export interface RelationRule{id:string;type:string;from:EntityQuery;to:EntityQuery;mode?:"first"|"each-to-first"|"chain"|"pairwise";bidirectional?:boolean}
const rid=(x:string)=>createHash("sha256").update(x).digest("hex").slice(0,32);
export function materializeRelations(world:MaterializedWorld,rules:RelationRule[]=[]):WorldRelation[]{
 const out:WorldRelation[]=[];const add=(rule:RelationRule,a:WorldEntity,b:WorldEntity)=>{if(a.id===b.id)return;const key=`${world.id}:${rule.id}:${a.id}:${b.id}`;out.push({id:rid(key),from:a.id,type:rule.type,to:b.id,source:"generated",sourceRef:rule.id});if(rule.bidirectional)out.push({id:rid(key+":reverse"),from:b.id,type:rule.type,to:a.id,source:"generated",sourceRef:rule.id})};
 for(const r of rules){const from=queryEntities(world,r.from),to=queryEntities(world,r.to);if(!from.length||!to.length)continue;
  if((r.mode??"each-to-first")==="first"){add(r,from[0]!,to[0]!);continue}
  if(r.mode==="chain"){const all=[...new Map([...from,...to].map(e=>[e.id,e])).values()];for(let i=0;i<all.length-1;i++)add(r,all[i]!,all[i+1]!);continue}
  if(r.mode==="pairwise"){for(const a of from)for(const b of to)if(a.id<b.id)add(r,a,b);continue}
  for(const a of from){const b=to.find(x=>x.id!==a.id);if(b)add(r,a,b)}
 }return out;
}
