import{randomUUID}from"node:crypto";
import type{MaterializedValue,MaterializedWorld,WorldEntity}from"@masterhost/domain";

const clone=(world:MaterializedWorld)=>structuredClone(world);
const finish=(world:MaterializedWorld,entity?:WorldEntity)=>{if(entity)entity.revision++;world.revision++;world.updatedAt=new Date().toISOString();return world};
const entity=(world:MaterializedWorld,id:string)=>{const found=world.entities.find(value=>value.id===id);if(!found)throw Error("entity not found");return found};
const descendants=(world:MaterializedWorld,id:string)=>{const ids=new Set([id]);let changed=true;while(changed){changed=false;for(const item of world.entities)if(item.parentId&&ids.has(item.parentId)&&!ids.has(item.id)){ids.add(item.id);changed=true}}return ids};
const scan=(value:unknown,visit:(value:string)=>void)=>{if(typeof value==="string")visit(value);else if(Array.isArray(value))value.forEach(item=>scan(item,visit));else if(value&&typeof value==="object")Object.values(value).forEach(item=>scan(item,visit))};

export function createWorldEntity(world:MaterializedWorld,input:{kind:string;name:string;parentId?:string;values?:Record<string,unknown>;tags?:string[]}){
 const next=clone(world);if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(input.kind))throw Error("invalid entity kind");if(!input.name.trim()||input.name.length>120)throw Error("invalid entity name");
 const parent=input.parentId?entity(next,input.parentId):undefined,id=randomUUID(),segment=id.slice(0,8),path=`${parent?parent.materializationPath+".":""}custom.${input.kind}.${segment}`;
 const values:Record<string,MaterializedValue>={name:{value:input.name.trim(),source:"custom",locked:true}};for(const[key,value]of Object.entries(input.values??{})){if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(key))throw Error(`invalid value key ${key}`);values[key]={value,source:"custom",locked:true}}
 const created:WorldEntity={id,worldId:next.id,kind:input.kind,materializationPath:path,parentId:parent?.id,values,traits:[],tags:[...new Set(input.tags??[])],revision:1};next.entities.push(created);finish(next);return{world:next,entity:created};
}

export function updateWorldEntity(world:MaterializedWorld,id:string,input:{kind?:string;parentId?:string|null;tags?:string[];traits?:string[]}){
 const next=clone(world),target=entity(next,id);if(input.kind!==undefined){if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(input.kind))throw Error("invalid entity kind");target.kind=input.kind}
 if(input.parentId!==undefined){if(input.parentId===null)delete target.parentId;else{if(input.parentId===id||descendants(next,id).has(input.parentId))throw Error("entity parent would create a cycle");entity(next,input.parentId);target.parentId=input.parentId}}
 if(input.tags)target.tags=[...new Set(input.tags.map(value=>value.trim()).filter(Boolean))];if(input.traits)target.traits=[...new Set(input.traits.map(value=>value.trim()).filter(Boolean))];return finish(next,target);
}

export function editWorldValue(world:MaterializedWorld,baseline:MaterializedWorld,id:string,key:string,input:{mode:"custom"|"auto"|"lock"|"unlock"|"reset";value?:unknown}){
 const next=clone(world),target=entity(next,id);if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(key))throw Error("invalid value key");const current=target.values[key],base=baseline.entities.find(value=>value.materializationPath===target.materializationPath)?.values[key];
 if(input.mode==="custom")target.values[key]={value:input.value,source:"custom",locked:current?.locked??false};
 else if(input.mode==="lock"){if(!current)throw Error("value not found");current.locked=true}
 else if(input.mode==="unlock"){if(!current)throw Error("value not found");current.locked=false}
 else if(input.mode==="reset"){if(base)target.values[key]=structuredClone(base);else delete target.values[key]}
 else{if(!base)throw Error("Pack has no automatic value for this custom property");target.values[key]={...structuredClone(base),locked:false}}
 return finish(next,target);
}

export interface WorldDependencyEdge{from:string;to:string;type:"parent"|"reference";property?:string}
export function worldDependencyGraph(world:MaterializedWorld){const ids=new Map(world.entities.flatMap(value=>[[value.id,value.id],[value.materializationPath,value.id]] as [string,string][])),edges:WorldDependencyEdge[]=[];for(const item of world.entities){if(item.parentId)edges.push({from:item.id,to:item.parentId,type:"parent"});for(const[key,value]of Object.entries(item.values))scan(value.value,candidate=>{const to=ids.get(candidate);if(to&&to!==item.id)edges.push({from:item.id,to,type:"reference",property:key})})}return{nodes:world.entities.map(value=>({id:value.id,label:String(value.values.name?.value??value.kind),kind:value.kind,path:value.materializationPath})),edges};}

export function entityRemovalImpact(world:MaterializedWorld,id:string){entity(world,id);const removed=descendants(world,id),graph=worldDependencyGraph(world),inbound=graph.edges.filter(edge=>removed.has(edge.to)&&!removed.has(edge.from));return{entityId:id,removeCount:removed.size,entities:world.entities.filter(value=>removed.has(value.id)).map(value=>({id:value.id,label:String(value.values.name?.value??value.kind),kind:value.kind,path:value.materializationPath})),inbound};}
export function removeWorldEntity(world:MaterializedWorld,id:string){const impact=entityRemovalImpact(world,id);if(impact.inbound.length)throw Object.assign(Error("entity has inbound references"),{statusCode:409,impact});const next=clone(world),removed=new Set(impact.entities.map(value=>value.id));next.entities=next.entities.filter(value=>!removed.has(value.id));return{world:finish(next),impact};}

export function entityRegenerationImpact(world:MaterializedWorld,fresh:MaterializedWorld,id:string){const target=entity(world,id);if(!target.templateRef)throw Error("custom entities cannot be regenerated from Pack");const prefix=target.materializationPath,old=world.entities.filter(value=>value.materializationPath===prefix||value.materializationPath.startsWith(prefix+".")),generated=fresh.entities.filter(value=>value.materializationPath===prefix||value.materializationPath.startsWith(prefix+"."));const byPath=new Map(generated.map(value=>[value.materializationPath,value]));let changed=0,preserved=0,locked=0;for(const item of old){const next=byPath.get(item.materializationPath);for(const[key,value]of Object.entries(item.values)){if(value.locked)locked++;else if(value.source==="custom")preserved++;else if(JSON.stringify(value.value)!==JSON.stringify(next?.values[key]?.value))changed++}}return{entityId:id,scope:prefix,changed,created:generated.filter(value=>!old.some(item=>item.materializationPath===value.materializationPath)).length,removed:old.filter(value=>value.templateRef&& !byPath.has(value.materializationPath)).length,preserved,locked};}

export function regenerateWorldEntity(world:MaterializedWorld,fresh:MaterializedWorld,id:string){const impact=entityRegenerationImpact(world,fresh,id),next=clone(world),prefix=impact.scope,oldByPath=new Map(next.entities.map(value=>[value.materializationPath,value])),generated=fresh.entities.filter(value=>value.materializationPath===prefix||value.materializationPath.startsWith(prefix+".")).map(value=>structuredClone(value));for(const item of generated){const old=oldByPath.get(item.materializationPath);if(old){item.id=old.id;item.parentId=old.parentId;item.assets=old.assets;for(const[key,value]of Object.entries(old.values))if(value.locked||value.source==="custom")item.values[key]=structuredClone(value);item.revision=old.revision+1}}
 next.entities=next.entities.filter(value=>!value.templateRef||!(value.materializationPath===prefix||value.materializationPath.startsWith(prefix+"."))).concat(generated);return{world:finish(next),impact};}
