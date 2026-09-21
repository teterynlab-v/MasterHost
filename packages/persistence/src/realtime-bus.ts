import postgres from "postgres";
import { randomUUID } from "node:crypto";

export interface RealtimeBusMessage { id:string; sessionId:string; type:string; payload:unknown; participantId?:string; sequence:number; at:string }
export class PostgresRealtimeBus {
  private publisher;private subscriber;private listener?:any;
  constructor(url:string){this.publisher=postgres(url);this.subscriber=postgres(url)}
  async migrate(){await this.publisher`create table if not exists realtime_messages(id uuid primary key,session_id uuid not null,message jsonb not null,created_at timestamptz not null default now())`;await this.publisher`create index if not exists realtime_messages_created on realtime_messages(created_at)`}
  async subscribe(deliver:(message:RealtimeBusMessage)=>void|Promise<void>){this.listener=await this.subscriber.listen("masterhost_realtime",async id=>{const row=(await this.subscriber`select message from realtime_messages where id=${id}`)[0];if(row)await deliver(row.message as RealtimeBusMessage)});return this.listener}
  async publish(message:Omit<RealtimeBusMessage,"id"|"at">){const full:RealtimeBusMessage={...message,id:randomUUID(),at:new Date().toISOString()};await this.publisher.begin(async tx=>{await tx`insert into realtime_messages(id,session_id,message) values(${full.id},${full.sessionId},${tx.json(full as any)})`;await tx`select pg_notify('masterhost_realtime',${full.id})`});return full}
  async cleanup(){await this.publisher`delete from realtime_messages where created_at<now()-interval '1 day'`}
  async close(){if(this.listener)await this.listener.unlisten();await Promise.all([this.publisher.end(),this.subscriber.end()])}
}
