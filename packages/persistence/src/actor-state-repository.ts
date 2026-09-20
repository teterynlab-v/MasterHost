import postgres from"postgres";import type{ActorRuntimeState}from"@masterhost/game-runtime";
export class ActorStateRepository{
 private sql;constructor(url:string){this.sql=postgres(url)}
 async migrate(){await this.sql`create table if not exists actor_runtime_state(session_id uuid not null,actor_id uuid not null,state jsonb not null,version bigint not null default 1,updated_at timestamptz not null default now(),primary key(session_id,actor_id))`;await this.sql`alter table actor_runtime_state add column if not exists version bigint not null default 1`}
 async get(sessionId:string,actorId:string){const r=(await this.sql`select state from actor_runtime_state where session_id=${sessionId} and actor_id=${actorId}`)[0];return(r?.state??null)as ActorRuntimeState|null}
 async save(sessionId:string,state:ActorRuntimeState){await this.sql`insert into actor_runtime_state(session_id,actor_id,state) values(${sessionId},${state.actorId},${this.sql.json(state as any)}) on conflict(session_id,actor_id) do update set state=excluded.state,version=actor_runtime_state.version+1,updated_at=now()`;return state}
 async all(sessionId:string){const r=await this.sql`select state from actor_runtime_state where session_id=${sessionId}`;return r.map(x=>x.state as ActorRuntimeState)}
 async allVersioned(sessionId:string){const rows=await this.sql`select state,version from actor_runtime_state where session_id=${sessionId}`;return rows.map(row=>({state:row.state as ActorRuntimeState,version:Number(row.version)}))}
 async close(){await this.sql.end()}
}
