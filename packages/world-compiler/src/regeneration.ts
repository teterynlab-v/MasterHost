import type{MaterializedWorld}from"@masterhost/domain";
export interface RegenerationImpact{changed:number;created:number;removed:number;preserved:number;blockedByLocks:number;details:{entityId:string;key:string;action:"change"|"preserve"|"locked"}[]}
export function compareWorlds(oldWorld:MaterializedWorld,newWorld:MaterializedWorld):RegenerationImpact{
 const oldBy=new Map(oldWorld.entities.map(e=>[e.materializationPath,e]));
 const nextBy=new Map(newWorld.entities.map(e=>[e.materializationPath,e]));
 let changed=0,preserved=0,blockedByLocks=0;const details:RegenerationImpact["details"]=[];
 for(const[k,o]of oldBy){const n=nextBy.get(k);if(!n)continue;for(const[key,v]of Object.entries(o.values)){if(v.locked){blockedByLocks++;details.push({entityId:o.id,key,action:"locked"});continue}if(v.source==="custom"){preserved++;details.push({entityId:o.id,key,action:"preserve"});continue}if(JSON.stringify(v.value)!==JSON.stringify(n.values[key]?.value)){changed++;details.push({entityId:o.id,key,action:"change"})}}}
 return{changed,created:[...nextBy.keys()].filter(k=>!oldBy.has(k)).length,removed:[...oldBy.keys()].filter(k=>!nextBy.has(k)).length,preserved,blockedByLocks,details};
}
