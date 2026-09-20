import postgres from "postgres";
import type { Encounter } from "@masterhost/game-runtime";

export class EncounterRepository {
  private sql;
  constructor(url: string) { this.sql = postgres(url); }
  async migrate() { await this.sql`create table if not exists encounters(id uuid primary key,session_id uuid not null,state jsonb not null,version bigint not null default 1,updated_at timestamptz not null default now())`; await this.sql`alter table encounters add column if not exists version bigint not null default 1`; }
  async get(id: string): Promise<Encounter | null> { const row = (await this.sql`select state from encounters where id=${id}`)[0]; return row ? row.state as Encounter : null; }
  async getVersioned(id: string): Promise<{encounter:Encounter;version:number}|null> { const row = (await this.sql`select state,version from encounters where id=${id}`)[0]; return row ? {encounter:row.state as Encounter,version:Number(row.version)} : null; }
  async save(encounter: Encounter) { await this.sql`insert into encounters(id,session_id,state) values(${encounter.id},${encounter.sessionId},${this.sql.json(encounter as any)}) on conflict(id) do update set state=excluded.state,version=encounters.version+1,updated_at=now()`; return encounter; }
  async forSession(sessionId: string): Promise<Encounter[]> { const rows = await this.sql`select state from encounters where session_id=${sessionId} order by updated_at desc`; return rows.map(row => row.state as Encounter); }
  async close() { await this.sql.end(); }
}
