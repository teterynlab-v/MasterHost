import{zipSync,unzipSync,strToU8,strFromU8}from"fflate";import type{MaterializedWorld}from"@masterhost/domain";import{assertWorldAssetReferences}from"@masterhost/domain";import{exportMhWorld,verifyMhWorld,type MhWorldBundle}from"./mhworld.js";
import{randomUUID}from"node:crypto";import{z}from"zod";
import{createHash}from"node:crypto";
import{validateWorldImage}from"./world-assets.js";
const digest=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const safePath=(path:string)=>!!path&&!path.startsWith("/")&&!path.includes("\\")&&!path.split("/").some(part=>part===".."||part===".");
function scanZip(bytes:Uint8Array){
 if(bytes.length>10_000_000)throw Error("mhworld archive exceeds 10 MB limit");
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
 for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65_557);p--)if(view.getUint32(p,true)===0x06054b50){end=p;break}
 if(end<0)throw Error("Invalid ZIP directory");
 const count=view.getUint16(end+10,true),size=view.getUint32(end+12,true),offset=view.getUint32(end+16,true);
 if(count>64||offset+size>bytes.length)throw Error("Invalid or oversized ZIP directory");
 let position=offset,total=0;const names=new Set<string>();
 for(let i=0;i<count;i++){
  if(position+46>bytes.length||view.getUint32(position,true)!==0x02014b50)throw Error("Invalid ZIP entry");
  if(view.getUint16(position+8,true)&1)throw Error("Encrypted ZIP entries are unsupported");
  const uncompressed=view.getUint32(position+24,true),nameLength=view.getUint16(position+28,true),extraLength=view.getUint16(position+30,true),commentLength=view.getUint16(position+32,true);
  const name=new TextDecoder().decode(bytes.slice(position+46,position+46+nameLength));
  if(!safePath(name)||names.has(name))throw Error(`Unsafe or duplicate archive path ${name}`);
  names.add(name);total+=uncompressed;
  if(uncompressed>10_000_000||total>40_000_000)throw Error("mhworld uncompressed size limit exceeded");
  position+=46+nameLength+extraLength+commentLength;
 }
 if(position!==offset+size)throw Error("Invalid ZIP directory size");
}
export function exportMhWorldZip(world:MaterializedWorld,assets:Record<string,Uint8Array>={}){
 assertWorldAssetReferences(world);
 const b=exportMhWorld(world),files:Record<string,Uint8Array>={"manifest.json":strToU8(JSON.stringify(b.manifest,null,2)),"descriptor.json":strToU8(b.descriptor),"world/entities.ndjson":strToU8(b.entities),"world/metadata.json":strToU8(b.metadata),"checksums.json":strToU8(JSON.stringify(b.checksums,null,2))};
 if(Object.keys(assets).length!==Object.keys(world.assets??{}).length)throw Error("World asset set is incomplete");
 for(const[k,v]of Object.entries(assets)){if(!safePath(k)||!world.assets?.[k]||world.assets[k].checksum!==digest(v)||world.assets[k].size!==v.length)throw Error(`Invalid World asset ${k}`);files[`assets/${k}`]=v;b.checksums[`assets/${k}`]=digest(v)}
 files["checksums.json"]=strToU8(JSON.stringify(b.checksums,null,2));
 return zipSync(files,{level:6,mtime:new Date(1980,0,1)});
}
export function inspectMhWorldZip(bytes:Uint8Array){scanZip(bytes);const f=unzipSync(bytes),required=new Set(["manifest.json","descriptor.json","world/entities.ndjson","world/metadata.json","checksums.json"]);for(const k of Object.keys(f))if(!safePath(k)||!required.has(k)&&!k.startsWith("assets/"))throw Error(`Unsafe archive path ${k}`);
 const req=(k:string)=>{if(!f[k])throw Error(`Missing ${k}`);return strFromU8(f[k]!)};
 const b:MhWorldBundle={manifest:JSON.parse(req("manifest.json")),descriptor:req("descriptor.json"),entities:req("world/entities.ndjson"),metadata:req("world/metadata.json"),checksums:JSON.parse(req("checksums.json"))};
 if(!verifyMhWorld(b))throw Error("mhworld checksum verification failed");return{bundle:b,assetNames:Object.keys(f).filter(k=>k.startsWith("assets/")),assets:Object.fromEntries(Object.entries(f).filter(([k])=>k.startsWith("assets/")).map(([k,v])=>[k.slice(7),v]))};
}
const Identifier=z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const Value=z.object({value:z.unknown(),source:z.enum(["pack","generated","custom","runtime"]),sourceRef:z.string().optional(),locked:z.boolean()}).passthrough();
const Entity=z.object({id:Identifier,worldId:Identifier,kind:z.string().min(1),templateRef:z.string().optional(),materializationPath:z.string().min(1),parentId:Identifier.optional(),values:z.record(z.string(),Value),traits:z.array(z.string()),tags:z.array(z.string()),revision:z.number().int().positive()}).passthrough();
const DescriptorValue=z.union([z.object({mode:z.literal("default")}),z.object({mode:z.literal("generated"),generator:z.string().optional()}),z.object({mode:z.literal("constrained"),constraints:z.array(z.record(z.string(),z.unknown()))}),z.object({mode:z.literal("explicit"),value:z.unknown()}),z.object({mode:z.literal("inherited"),source:z.string()})]);
const Descriptor=z.object({schemaVersion:z.string(),worldPack:z.object({id:z.string(),version:z.string()}),decisions:z.record(z.string(),DescriptorValue),locks:z.array(z.string()),seedPolicy:z.enum(["random","explicit"]),seed:z.string().optional()}).passthrough();
const Role=z.enum(["portrait","token","card","background","map","item","location","ui"]),RoleMap=z.partialRecord(Role,z.string()),ArtSet=z.object({id:z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/),name:z.string().min(1),description:z.string().optional(),defaults:RoleMap.optional(),families:z.record(z.string(),RoleMap).optional(),types:z.record(z.string(),RoleMap).optional()}).strict(),Authoring=z.object({assetMetadata:z.record(z.string(),z.object({title:z.string().optional(),tags:z.array(z.string()),variants:z.array(z.string())}).strict()).optional(),artSets:z.record(z.string(),ArtSet).optional(),activeArtSetId:z.string().optional()}).strict();
const Metadata=z.object({id:Identifier,realmId:Identifier,name:z.string().min(1),seed:z.string(),status:z.enum(["draft","ready","published","archived"]),revision:z.number().int().positive(),createdAt:z.iso.datetime(),updatedAt:z.iso.datetime(),assets:z.record(z.string(),z.object({checksum:z.string().regex(/^[a-f0-9]{64}$/),mediaType:z.string(),size:z.number().int().min(0).max(10_000_000)})).optional(),authoring:Authoring.optional()}).passthrough();
export function importMhWorldZipWithAssets(bytes:Uint8Array,realmId:string):{world:MaterializedWorld;assets:Record<string,Uint8Array>}{
 const {bundle,assets}=inspectMhWorldZip(bytes);
 if(bundle.manifest.format!=="mhworld"||bundle.manifest.version!=="0.1")throw Error("Unsupported mhworld format");
 const descriptor=Descriptor.parse(JSON.parse(bundle.descriptor)),metadata=Metadata.parse(JSON.parse(bundle.metadata));
 if(Object.keys(assets).length!==Object.keys(metadata.assets??{}).length)throw Error("mhworld asset set mismatch");
 for(const[path,value]of Object.entries(assets)){if(!safePath(path)||!metadata.assets?.[path]||metadata.assets[path].size!==value.length||metadata.assets[path].checksum!==digest(value)||bundle.checksums[`assets/${path}`]!==digest(value))throw Error(`mhworld asset checksum or metadata mismatch: ${path}`);validateWorldImage(path,metadata.assets[path].mediaType,value)}
 const entities=bundle.entities?bundle.entities.split("\n").map(line=>Entity.parse(JSON.parse(line))):[];
 if(bundle.manifest.worldId!==metadata.id||descriptor.worldPack.id!==bundle.manifest.packId||descriptor.worldPack.version!==bundle.manifest.packVersion)throw Error("mhworld provenance mismatch");
 const paths=new Set<string>(),ids=new Set<string>();for(const entity of entities){if(entity.worldId!==metadata.id||paths.has(entity.materializationPath)||ids.has(entity.id))throw Error("mhworld entity identity mismatch");paths.add(entity.materializationPath);ids.add(entity.id)}
 for(const entity of entities)if(entity.parentId&&!ids.has(entity.parentId))throw Error(`mhworld dangling parent ${entity.parentId}`);
 const id=randomUUID(),idMap=new Map(entities.map(entity=>[entity.id,randomUUID()])),now=new Date().toISOString();
 for(const[name,entry]of Object.entries(metadata.authoring?.assetMetadata??{})){if(!metadata.assets?.[name]||entry.variants.some(variant=>!metadata.assets?.[variant]||variant===name))throw Error(`invalid media metadata ${name}`)}for(const set of Object.values(metadata.authoring?.artSets??{}))for(const mapping of [set.defaults,...Object.values(set.families??{}),...Object.values(set.types??{})])for(const name of Object.values(mapping??{}))if(!metadata.assets?.[name])throw Error(`invalid Art Set asset ${name}`);
 const world:MaterializedWorld={id,realmId,name:metadata.name,packId:bundle.manifest.packId,packVersion:bundle.manifest.packVersion,descriptor,seed:metadata.seed,status:"draft",revision:1,createdAt:now,updatedAt:now,...(metadata.assets?{assets:metadata.assets}:{}),...(metadata.authoring?{authoring:metadata.authoring}:{}),entities:entities.map(entity=>({...entity,id:idMap.get(entity.id)!,worldId:id,parentId:entity.parentId?idMap.get(entity.parentId):undefined,revision:1}))};
 assertWorldAssetReferences(world);return{world,assets};
}
export function importMhWorldZip(bytes:Uint8Array,realmId:string):MaterializedWorld{const result=importMhWorldZipWithAssets(bytes,realmId);if(Object.keys(result.assets).length)throw Error("Asset import requires persistent storage");return result.world}
