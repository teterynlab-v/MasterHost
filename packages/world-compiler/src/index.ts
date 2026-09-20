import{createHash,randomUUID}from"node:crypto";import type{MaterializedWorld,WorldDescriptor,WorldEntity}from"@masterhost/domain";import type{LoadedWorldPack}from"@masterhost/worldpack-sdk";import{materializeTemplate}from"@masterhost/template-engine";
function uid(w:string,p:string){const h=createHash("sha256").update(`${w}:${p}`).digest("hex");return`${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`}
export function compileWorld(a:{realmId:string;descriptor:WorldDescriptor;pack:LoadedWorldPack;seed:string;worldId?:string}):MaterializedWorld{const id=a.worldId??randomUUID(),drafts=materializeTemplate({pack:a.pack,descriptor:a.descriptor,seed:a.seed},a.pack.manifest.entryTemplate),ids=new Map(drafts.map(x=>[x.path,uid(id,x.path)]));const entities:WorldEntity[]=drafts.map(x=>({id:ids.get(x.path)!,worldId:id,kind:x.kind,templateRef:x.templateRef,materializationPath:x.path,parentId:x.parentPath?ids.get(x.parentPath):undefined,values:x.values,traits:x.traits,tags:x.tags,revision:1}));const now=new Date().toISOString();return{id,realmId:a.realmId,name:String(entities[0]?.values.name?.value??"Untitled World"),packId:a.pack.manifest.id,packVersion:a.pack.manifest.version,descriptor:a.descriptor,seed:a.seed,status:"draft",revision:1,createdAt:now,updatedAt:now,entities}}
export function customizeValue(w:MaterializedWorld,eid:string,key:string,value:unknown,locked=true){const n=structuredClone(w),e=n.entities.find(x=>x.id===eid);if(!e)throw Error("entity not found");e.values[key]={value,source:"custom",locked};e.revision++;n.revision++;return n}
export function regenerateWorld(a:{world:MaterializedWorld;pack:LoadedWorldPack}){const old=a.world,fresh=compileWorld({realmId:old.realmId,descriptor:old.descriptor,pack:a.pack,seed:`${old.seed}:regen:${old.revision+1}`,worldId:old.id});preserveCustomByPath(old,fresh);fresh.revision=old.revision+1;fresh.createdAt=old.createdAt;return fresh}
export const regenerateSettlement=(w:MaterializedWorld)=>w;

export * from "./relations.js";
export * from "./constraints.js";
export * from "./report.js";

export * from "./regeneration.js";

export * from "./dependency.js";
export * from "./relation-materializer.js";
export * from "./constraint-compiler.js";
export * from "./scope.js";

export * from "./identity.js";
export * from "./repair.js";
import {preserveCustomByPath} from "./identity.js";
