import{createHash}from"node:crypto";import type{MaterializedWorld}from"@masterhost/domain";
const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
export interface MhWorldBundle{manifest:{format:"mhworld";version:"0.1";worldId:string;packId:string;packVersion:string};descriptor:string;entities:string;metadata:string;checksums:Record<string,string>}
export function exportMhWorld(world:MaterializedWorld):MhWorldBundle{
 const descriptor=JSON.stringify(world.descriptor),entities=world.entities.map(e=>JSON.stringify(e)).join("\n"),metadata=JSON.stringify({id:world.id,realmId:world.realmId,name:world.name,seed:world.seed,status:world.status,revision:world.revision,createdAt:world.createdAt,updatedAt:world.updatedAt});
 return{manifest:{format:"mhworld",version:"0.1",worldId:world.id,packId:world.packId,packVersion:world.packVersion},descriptor,entities,metadata,checksums:{"descriptor.json":sha(descriptor),"world/entities.ndjson":sha(entities),"world/metadata.json":sha(metadata)}};
}
export function verifyMhWorld(b:MhWorldBundle){const expected={"descriptor.json":sha(b.descriptor),"world/entities.ndjson":sha(b.entities),"world/metadata.json":sha(b.metadata)};return Object.entries(expected).every(([k,v])=>b.checksums[k]===v)}
