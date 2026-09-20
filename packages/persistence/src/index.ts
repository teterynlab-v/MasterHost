import postgres from "postgres";
import { randomUUID } from "node:crypto";
import type { MaterializedWorld } from "@masterhost/domain";

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
  }
  async save(w:MaterializedWorld, reason="autosave"){
    const previous=await this.get(w.id);
    if(previous && w.revision <= previous.revision) w.revision=previous.revision+1;
    await this.sql.begin(async tx=>{
      await tx`insert into worlds(id,realm_id,name,revision,data) values(${w.id},${w.realmId},${w.name},${w.revision},${tx.json(w as any)}) on conflict(id) do update set name=excluded.name,revision=excluded.revision,data=excluded.data,updated_at=now()`;
      await tx`insert into world_revisions(id,world_id,revision,reason,data) values(${randomUUID()},${w.id},${w.revision},${reason},${tx.json(w as any)}) on conflict(world_id,revision) do nothing`;
    });
    return w;
  }
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
