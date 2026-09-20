import{zipSync,unzipSync,strToU8,strFromU8}from"fflate";import type{MaterializedWorld}from"@masterhost/domain";import{exportMhWorld,verifyMhWorld,type MhWorldBundle}from"./mhworld.js";
export function exportMhWorldZip(world:MaterializedWorld,assets:Record<string,Uint8Array>={}){
 const b=exportMhWorld(world),files:Record<string,Uint8Array>={"manifest.json":strToU8(JSON.stringify(b.manifest,null,2)),"descriptor.json":strToU8(b.descriptor),"world/entities.ndjson":strToU8(b.entities),"world/metadata.json":strToU8(b.metadata),"checksums.json":strToU8(JSON.stringify(b.checksums,null,2))};
 for(const[k,v]of Object.entries(assets)){if(k.includes("..")||k.startsWith("/")||k.includes("\\"))throw Error(`Unsafe asset path ${k}`);files[`assets/${k}`]=v}
 return zipSync(files,{level:6});
}
export function inspectMhWorldZip(bytes:Uint8Array){const f=unzipSync(bytes);for(const k of Object.keys(f))if(k.includes("..")||k.startsWith("/")||k.includes("\\"))throw Error(`Unsafe archive path ${k}`);
 const req=(k:string)=>{if(!f[k])throw Error(`Missing ${k}`);return strFromU8(f[k]!)};
 const b:MhWorldBundle={manifest:JSON.parse(req("manifest.json")),descriptor:req("descriptor.json"),entities:req("world/entities.ndjson"),metadata:req("world/metadata.json"),checksums:JSON.parse(req("checksums.json"))};
 if(!verifyMhWorld(b))throw Error("mhworld checksum verification failed");return{bundle:b,assetNames:Object.keys(f).filter(k=>k.startsWith("assets/"))};
}
