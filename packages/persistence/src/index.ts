import postgres from "postgres";
import { randomUUID } from "node:crypto";
import { assetChecksum, validateWorldImage } from "./world-assets.js";
import type { MaterializedWorld } from "@masterhost/domain";
import { assertWorldAssetReferences } from "@masterhost/domain";

export interface RevisionInfo { id:string; worldId:string; revision:number; reason:string; createdAt:string }
export interface SnapshotInfo { id:string; worldId:string; name:string; revision:number; createdAt:string }

export class WorldRepository {
  private sql;
  constructor(url:string){ this.sql=postgres(url); }
  async migrate(){
    await this.sql`create table if not exists worlds(id uuid primary key,realm_id uuid not null,name text not null,revision int not null,data jsonb not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now())`;
    await this.sql`create table if not exists world_revisions(id uuid primary key,world_id uuid not null,revision int not null,reason text not null,data jsonb not null,created_at timestamptz not null default now())`;
    await this.sql`create unique index if not exists world_revision_unique on world_revisions(world_id,revision)`;
    await this.sql`create table if not exists world_snapshots(id uuid primary key,world_id uuid not null,name text not null,revision int not null,data jsonb not null,created_at timestamptz not null default now())`;
    await this.sql`create table if not exists world_asset_blobs(checksum text primary key,data bytea not null)`;
  }
  async save(w:MaterializedWorld, reason="autosave"){
    assertWorldAssetReferences(w);
    await this.sql.begin(async tx=>{
      const current=(await tx`select revision from worlds where id=${w.id} for update`)[0];
      if(current&&Number(current.revision)+1!==w.revision)throw Object.assign(Error("World revision changed; reload and retry"),{statusCode:409});
      if(current)await tx`update worlds set name=${w.name},revision=${w.revision},data=${tx.json(w as any)},updated_at=now() where id=${w.id}`;
      else await tx`insert into worlds(id,realm_id,name,revision,data) values(${w.id},${w.realmId},${w.name},${w.revision},${tx.json(w as any)})`;
      await tx`insert into world_revisions(id,world_id,revision,reason,data) values(${randomUUID()},${w.id},${w.revision},${reason},${tx.json(w as any)})`;
    });
    return w;
  }
  async saveImported(w:MaterializedWorld,assets:Record<string,Uint8Array>){
    assertWorldAssetReferences(w);
    await this.sql.begin(async tx=>{
      for(const[path,ref]of Object.entries(w.assets??{})){
        const data=assets[path];if(!data||assetChecksum(data)!==ref.checksum||data.length!==ref.size)throw Error(`Missing or invalid asset ${path}`);validateWorldImage(path,ref.mediaType,data);
        await tx`insert into world_asset_blobs(checksum,data) values(${ref.checksum},${Buffer.from(data)}) on conflict(checksum) do nothing`;
      }
      await tx`insert into worlds(id,realm_id,name,revision,data) values(${w.id},${w.realmId},${w.name},${w.revision},${tx.json(w as any)})`;
      await tx`insert into world_revisions(id,world_id,revision,reason,data) values(${randomUUID()},${w.id},${w.revision},'import',${tx.json(w as any)})`;
    });return w;
  }
  async putAsset(worldId:string,path:string,mediaType:string,data:Uint8Array,replaceAssigned=false){
    validateWorldImage(path,mediaType,data);
    const checksum=assetChecksum(data);
    return this.sql.begin(async tx=>{
      const row=(await tx`select data from worlds where id=${worldId} for update`)[0];if(!row)throw Error("world not found");
      const world=row.data as MaterializedWorld;
      if(!world.assets?.[path]&&Object.keys(world.assets??{}).length>=20)throw Error("World asset limit exceeded");
      const replacing=world.assets?.[path]?.checksum!==undefined&&world.assets[path]!.checksum!==checksum,assigned=world.entities.some(entity=>Object.values(entity.assets?.roles??{}).some(ref=>ref?.path===path));if(replacing&&assigned&&!replaceAssigned)throw Error("Assigned image replacement requires explicit confirmation");
      await tx`insert into world_asset_blobs(checksum,data) values(${checksum},${Buffer.from(data)}) on conflict(checksum) do nothing`;
      world.assets={...world.assets,[path]:{checksum,mediaType,size:data.length}};world.authoring={...world.authoring,assetMetadata:{...world.authoring?.assetMetadata,[path]:world.authoring?.assetMetadata?.[path]??{tags:[],variants:[]}}};if(replacing&&assigned)for(const entity of world.entities)for(const ref of Object.values(entity.assets?.roles??{}))if(ref?.path===path)ref.checksum=checksum;world.revision++;world.updatedAt=new Date().toISOString();
      await tx`update worlds set data=${tx.json(world as any)},revision=${world.revision},updated_at=now() where id=${worldId}`;
      await tx`insert into world_revisions(id,world_id,revision,reason,data) values(${randomUUID()},${worldId},${world.revision},${`asset:${path}`},${tx.json(world as any)})`;
      return world;
    });
  }
  async updateAssetMetadata(worldId:string,path:string,input:{title?:string;tags?:string[];variants?:string[]}){
    const world=await this.get(worldId);if(!world?.assets?.[path])throw Error("asset not found");const variants=[...new Set(input.variants??world.authoring?.assetMetadata?.[path]?.variants??[])];for(const name of variants)if(!world.assets[name]||name===path)throw Error(`invalid asset variant ${name}`);world.authoring={...world.authoring,assetMetadata:{...world.authoring?.assetMetadata,[path]:{title:input.title?.trim()||undefined,tags:[...new Set((input.tags??[]).map(value=>value.trim()).filter(Boolean))],variants}}};world.revision++;world.updatedAt=new Date().toISOString();return this.save(world,`asset-metadata:${path}`);
  }
  async deleteAsset(worldId:string,path:string){const world=await this.get(worldId);if(!world?.assets?.[path])throw Error("asset not found");if(world.entities.some(entity=>Object.values(entity.assets?.roles??{}).some(ref=>ref?.path===path)))throw Object.assign(Error("asset is assigned to an entity"),{statusCode:409});if(Object.values(world.authoring?.artSets??{}).some(set=>JSON.stringify(set).includes(`\"${path}\"`)))throw Object.assign(Error("asset is used by an Art Set"),{statusCode:409});const next=structuredClone(world);delete next.assets![path];if(next.authoring?.assetMetadata){delete next.authoring.assetMetadata[path];for(const metadata of Object.values(next.authoring.assetMetadata))metadata.variants=metadata.variants.filter(value=>value!==path)}next.revision++;next.updatedAt=new Date().toISOString();return this.save(next,`asset-delete:${path}`)}
  async asset(worldId:string,path:string){const world=await this.get(worldId),ref=world?.assets?.[path];if(!ref)return null;const row=(await this.sql`select data from world_asset_blobs where checksum=${ref.checksum}`)[0];if(!row)throw Error(`Missing stored asset ${path}`);const data=new Uint8Array(row.data as Buffer);if(assetChecksum(data)!==ref.checksum||data.length!==ref.size)throw Error(`Corrupt stored asset ${path}`);return{data,mediaType:ref.mediaType};}
  async assets(worldId:string){const world=await this.get(worldId);if(!world)throw Error("world not found");return Object.fromEntries(await Promise.all(Object.keys(world.assets??{}).map(async path=>[path,(await this.asset(worldId,path))!.data] as const)));}
  async get(id:string){ const r=await this.sql`select data from worlds where id=${id}`; return (r[0]?.data??null) as MaterializedWorld|null; }
  async list(){ const r=await this.sql`select data from worlds order by updated_at desc`; return r.map(x=>x.data as MaterializedWorld); }
  async revisions(worldId:string):Promise<RevisionInfo[]>{ const r=await this.sql`select id,world_id,revision,reason,created_at from world_revisions where world_id=${worldId} order by revision desc`; return r.map(x=>({id:x.id as string,worldId:x.world_id as string,revision:Number(x.revision),reason:x.reason as string,createdAt:new Date(x.created_at as any).toISOString()})); }
  async snapshot(w:MaterializedWorld,name:string){ const id=randomUUID(); await this.sql`insert into world_snapshots(id,world_id,name,revision,data) values(${id},${w.id},${name},${w.revision},${this.sql.json(w as any)})`; return {id,worldId:w.id,name,revision:w.revision}; }
  async snapshots(worldId:string):Promise<SnapshotInfo[]>{ const r=await this.sql`select id,world_id,name,revision,created_at from world_snapshots where world_id=${worldId} order by created_at desc`; return r.map(x=>({id:x.id as string,worldId:x.world_id as string,name:x.name as string,revision:Number(x.revision),createdAt:new Date(x.created_at as any).toISOString()})); }
  async restore(snapshotId:string){ const r=await this.sql`select data from world_snapshots where id=${snapshotId}`; if(!r[0])throw Error("snapshot not found"); const w=structuredClone(r[0].data as MaterializedWorld); const current=await this.get(w.id); w.revision=(current?.revision??w.revision)+1; w.updatedAt=new Date().toISOString(); return this.save(w,`restore:${snapshotId}`); }
  async fork(w:MaterializedWorld,name:string){
    const n=structuredClone(w), idMap=new Map<string,string>(); n.id=randomUUID(); n.name=name; n.revision=1; n.createdAt=n.updatedAt=new Date().toISOString();
    for(const e of n.entities) idMap.set(e.id,randomUUID());
    n.entities=n.entities.map(e=>({...e,id:idMap.get(e.id)!,worldId:n.id,parentId:e.parentId?idMap.get(e.parentId):undefined,revision:1}));
    return this.save(n,`fork:${w.id}`);
  }
  async close(){ await this.sql.end(); }
}
export * from "./export.js";

export * from "./revisions.js";

export * from "./mhworld.js";

export * from "./migrations.js";

export * from "./authoring.js";

export * from "./revision-repository.js";

export * from "./mhworld-zip.js";

export * from "./runtime-repository.js";

export * from "./game-repository.js";

export * from "./actor-state-repository.js";
export * from "./encounter-repository.js";
export * from "./runtime-mutation-repository.js";
export * from "./runtime-replay-repository.js";
export * from "./check-recovery-repository.js";
export * from "./migration-lock.js";
export { validateWorldImage, assetChecksum } from "./world-assets.js";
