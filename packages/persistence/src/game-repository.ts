import postgres from"postgres";import type{CheckRequest,CheckResolution}from"@masterhost/game-runtime";
import type { RuntimeIdempotency } from "./runtime-mutation-repository.js";
export class GameRepository{
 private sql;constructor(url:string){this.sql=postgres(url)}
 async migrate(){
  await this.sql`create table if not exists game_events(id uuid primary key,session_id uuid not null,sequence bigserial, event_type text not null,payload jsonb not null,created_at timestamptz not null default now())`;
  await this.sql`alter table game_events add column if not exists schema_version text not null default '1'`;
  await this.sql`create unique index if not exists game_events_session_seq on game_events(session_id,sequence)`;
  await this.sql`create table if not exists pending_checks(id uuid primary key,session_id uuid not null,participant_id uuid not null,check_id text not null,difficulty int not null,visibility text not null,status text not null,request jsonb not null,resolution jsonb null,created_at timestamptz not null default now(),resolved_at timestamptz null)`;
 }
 async event(sessionId:string,type:string,payload:unknown){const r=(await this.sql`insert into game_events(id,session_id,event_type,payload,schema_version) values(gen_random_uuid(),${sessionId},${type},${this.sql.json(payload as any)},'1') returning id,sequence,event_type,payload,schema_version,created_at`)[0]!;return{id:r.id,sequence:Number(r.sequence),type:r.event_type,payload:r.payload,schemaVersion:r.schema_version,createdAt:new Date(r.created_at as any).toISOString()}}
 async events(sessionId:string,afterSequence=0){const r=await this.sql`select id,sequence,event_type,payload,schema_version,created_at from game_events where session_id=${sessionId} and sequence>${afterSequence} order by sequence`;return r.map(x=>({id:x.id,sequence:Number(x.sequence),type:x.event_type,payload:x.payload,schemaVersion:x.schema_version,createdAt:new Date(x.created_at as any).toISOString()}))}
 async latestSequence(sessionId:string){const row=(await this.sql`select coalesce(max(sequence),0) as sequence from game_events where session_id=${sessionId}`)[0];return Number(row?.sequence??0)}
 async createCheck(c:CheckRequest,idempotency?:RuntimeIdempotency):Promise<{request:CheckRequest;replayed:boolean}>{
  return this.sql.begin(async sql=>{
   if(idempotency){
    const inserted=await sql`insert into runtime_command_receipts(session_id,key,fingerprint) values(${c.sessionId},${idempotency.key},${idempotency.fingerprint}) on conflict do nothing returning key`;
    if(!inserted.length){
     const row=(await sql`select fingerprint,result from runtime_command_receipts where session_id=${c.sessionId} and key=${idempotency.key}`)[0];
     if(!row||row.fingerprint!==idempotency.fingerprint||row.result===null)throw Object.assign(Error("runtime state changed; reload and retry"),{statusCode:409});
     return{request:row.result as CheckRequest,replayed:true};
    }
   }
   await sql`insert into pending_checks(id,session_id,participant_id,check_id,difficulty,visibility,status,request) values(${c.id},${c.sessionId},${c.participantId},${c.checkId},${c.difficulty},${c.visibility},${c.status},${sql.json({...c})})`;
   await sql`insert into game_events(id,session_id,event_type,payload,schema_version) values(gen_random_uuid(),${c.sessionId},'CheckRequested',${sql.json({...c})},'1')`;
   if(idempotency)await sql`update runtime_command_receipts set result=${sql.json({...c})} where session_id=${c.sessionId} and key=${idempotency.key}`;
   return{request:c,replayed:false};
  });
 }
 async check(id:string){const r=(await this.sql`select request,resolution from pending_checks where id=${id}`)[0];return r?{request:r.request as CheckRequest,resolution:r.resolution as CheckResolution|null}:null}
 async resolveCheck(id:string,res:CheckResolution){return this.sql.begin(async sql=>{const rows=await sql`select session_id,resolution from pending_checks where id=${id} for update`;const row=rows[0];if(!row)throw Error("check not found");if(row.resolution)return{resolution:row.resolution as CheckResolution,created:false};await sql`update pending_checks set status='resolved',resolution=${sql.json({...res,roll:{...res.roll}})},resolved_at=now() where id=${id}`;await sql`insert into game_events(id,session_id,event_type,payload,schema_version) values(gen_random_uuid(),${row.session_id},'DiceRolled',${sql.json({requestId:id,roll:{...res.roll}})},'1')`;await sql`insert into game_events(id,session_id,event_type,payload,schema_version) values(gen_random_uuid(),${row.session_id},'CheckResolved',${sql.json({...res,roll:{...res.roll}})},'1')`;return{resolution:res,created:true}})}
 async pendingForParticipant(sessionId:string,participantId:string){const r=await this.sql`select request,resolution from pending_checks where session_id=${sessionId} and participant_id=${participantId} order by created_at desc limit 20`;return r.map(x=>({request:x.request,resolution:x.resolution}))}
 async close(){await this.sql.end()}
}
