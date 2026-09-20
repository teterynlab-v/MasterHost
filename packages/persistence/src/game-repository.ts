import postgres from"postgres";import type{CheckRequest,CheckResolution}from"@masterhost/game-runtime";
export class GameRepository{
 private sql;constructor(url:string){this.sql=postgres(url)}
 async migrate(){
  await this.sql`create table if not exists game_events(id uuid primary key,session_id uuid not null,sequence bigserial, event_type text not null,payload jsonb not null,created_at timestamptz not null default now())`;
  await this.sql`alter table game_events add column if not exists schema_version text not null default '1'`;
  await this.sql`create unique index if not exists game_events_session_seq on game_events(session_id,sequence)`;
  await this.sql`create table if not exists pending_checks(id uuid primary key,session_id uuid not null,participant_id uuid not null,check_id text not null,difficulty int not null,visibility text not null,status text not null,request jsonb not null,resolution jsonb null,created_at timestamptz not null default now(),resolved_at timestamptz null)`;
 }
 async event(sessionId:string,type:string,payload:unknown){const r=(await this.sql`insert into game_events(id,session_id,event_type,payload,schema_version) values(gen_random_uuid(),${sessionId},${type},${this.sql.json(payload as any)},'1') returning id,sequence,event_type,payload,schema_version,created_at`)[0]!;return{id:r.id,sequence:Number(r.sequence),type:r.event_type,payload:r.payload,schemaVersion:r.schema_version,createdAt:new Date(r.created_at as any).toISOString()}}
 async events(sessionId:string){const r=await this.sql`select id,sequence,event_type,payload,schema_version,created_at from game_events where session_id=${sessionId} order by sequence`;return r.map(x=>({id:x.id,sequence:Number(x.sequence),type:x.event_type,payload:x.payload,schemaVersion:x.schema_version,createdAt:new Date(x.created_at as any).toISOString()}))}
 async createCheck(c:CheckRequest){await this.sql`insert into pending_checks(id,session_id,participant_id,check_id,difficulty,visibility,status,request) values(${c.id},${c.sessionId},${c.participantId},${c.checkId},${c.difficulty},${c.visibility},${c.status},${this.sql.json(c as any)})`;return c}
 async check(id:string){const r=(await this.sql`select request,resolution from pending_checks where id=${id}`)[0];return r?{request:r.request as CheckRequest,resolution:r.resolution as CheckResolution|null}:null}
 async resolveCheck(id:string,res:CheckResolution){await this.sql`update pending_checks set status='resolved',resolution=${this.sql.json(res as any)},resolved_at=now() where id=${id} and status='pending'`;return res}
 async pendingForParticipant(sessionId:string,participantId:string){const r=await this.sql`select request,resolution from pending_checks where session_id=${sessionId} and participant_id=${participantId} order by created_at desc limit 20`;return r.map(x=>({request:x.request,resolution:x.resolution}))}
 async close(){await this.sql.end()}
}
