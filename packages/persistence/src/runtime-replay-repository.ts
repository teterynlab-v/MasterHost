import { isDeepStrictEqual } from "node:util";
import postgres from "postgres";
import { replayRuntimeEvents } from "@masterhost/game-runtime";
import type { ActorRuntimeState, Encounter, ReplayEvent } from "@masterhost/game-runtime";

interface RuntimeRows { events: ReplayEvent[]; actors: ActorRuntimeState[]; encounters: Encounter[] }
interface Checkpoint { id: string; last_sequence: string; event_count: string; actors: ActorRuntimeState[]; encounters: Encounter[] }

function mismatched<T>(expected: T[], actual: T[], id: (item: T) => string): string[] {
  const left = new Map(expected.map(item => [id(item), item]));
  const right = new Map(actual.map(item => [id(item), item]));
  const storedShape = (value: T | undefined) => value === undefined ? undefined : JSON.parse(JSON.stringify(value)) as T;
  return [...new Set([...left.keys(), ...right.keys()])].filter(key => !isDeepStrictEqual(storedShape(left.get(key)), storedShape(right.get(key)))).sort();
}

function compare(rows: RuntimeRows, checkpoint?: Checkpoint) {
  const lastSequence = Number(checkpoint?.last_sequence ?? 0);
  const replayed = replayRuntimeEvents(rows.events, checkpoint ? { actors: checkpoint.actors, encounters: checkpoint.encounters, lastSequence } : undefined);
  const actorIds = mismatched(replayed.actors, rows.actors, actor => actor.actorId);
  const encounterIds = mismatched(replayed.encounters, rows.encounters, encounter => encounter.id);
  return {
    report: {
      matching: replayed.issues.length === 0 && actorIds.length === 0 && encounterIds.length === 0,
      eventCount: Number(checkpoint?.event_count ?? 0) + rows.events.length,
      actorIds, encounterIds, issues: replayed.issues,
    },
    replayed,
  };
}

export class RuntimeReplayRepository {
  private sql;
  constructor(url: string) { this.sql = postgres(url); }

  async migrate() {
    await this.sql`create table if not exists runtime_replay_snapshots(
      id uuid primary key default gen_random_uuid(),
      session_id uuid not null,
      last_sequence bigint not null,
      event_count bigint not null,
      actors jsonb not null,
      encounters jsonb not null,
      created_at timestamptz not null default now(),
      unique(session_id,last_sequence)
    )`;
    await this.sql`create table if not exists runtime_repair_log(
      id uuid primary key default gen_random_uuid(),
      session_id uuid not null,
      event_count bigint not null,
      actor_ids jsonb not null,
      encounter_ids jsonb not null,
      created_at timestamptz not null default now()
    )`;
  }

  async verify(sessionId: string) {
    // One statement reads events and materialized rows at the same MVCC snapshot.
    const row = (await this.sql`
      select
        coalesce((select jsonb_agg(jsonb_build_object('sequence',sequence,'type',event_type,'payload',payload,'schemaVersion',schema_version) order by sequence) from game_events where session_id=${sessionId}), '[]'::jsonb) as events,
        coalesce((select jsonb_agg(state order by actor_id) from actor_runtime_state where session_id=${sessionId}), '[]'::jsonb) as actors,
        coalesce((select jsonb_agg(state order by id) from encounters where session_id=${sessionId}), '[]'::jsonb) as encounters
    `)[0]! as unknown as RuntimeRows;
    return compare(row).report;
  }

  async createSnapshot(sessionId: string) {
    return this.sql.begin(async tx => {
      const row = (await tx`
        select
          coalesce((select jsonb_agg(jsonb_build_object('sequence',sequence,'type',event_type,'payload',payload,'schemaVersion',schema_version) order by sequence) from game_events where session_id=${sessionId}), '[]'::jsonb) as events,
          coalesce((select jsonb_agg(state order by actor_id) from actor_runtime_state where session_id=${sessionId}), '[]'::jsonb) as actors,
          coalesce((select jsonb_agg(state order by id) from encounters where session_id=${sessionId}), '[]'::jsonb) as encounters
      `)[0]! as unknown as RuntimeRows;
      const { report, replayed } = compare(row);
      if (!report.matching) throw Object.assign(Error("runtime replay does not match materialized state"), { statusCode: 409, report });
      const lastSequence = row.events.at(-1)?.sequence ?? 0;
      const inserted = await tx`insert into runtime_replay_snapshots(session_id,last_sequence,event_count,actors,encounters)
        values(${sessionId},${lastSequence},${row.events.length},${tx.json(replayed.actors as unknown as Parameters<typeof tx.json>[0])},${tx.json(replayed.encounters as unknown as Parameters<typeof tx.json>[0])})
        on conflict(session_id,last_sequence) do nothing returning id`;
      const id = inserted[0]?.id ?? (await tx`select id from runtime_replay_snapshots where session_id=${sessionId} and last_sequence=${lastSequence}`)[0]?.id;
      return { id, lastSequence, eventCount: row.events.length };
    });
  }

  async verifyFromSnapshot(sessionId: string) {
    // The checkpoint, later events, and materialized rows are read in one MVCC snapshot.
    const row = (await this.sql`
      with checkpoint as (
        select id,last_sequence,event_count,actors,encounters from runtime_replay_snapshots
        where session_id=${sessionId} order by last_sequence desc limit 1
      )
      select
        (select row_to_json(checkpoint) from checkpoint) as checkpoint,
        coalesce((select jsonb_agg(jsonb_build_object('sequence',sequence,'type',event_type,'payload',payload,'schemaVersion',schema_version) order by sequence) from game_events where session_id=${sessionId} and sequence>coalesce((select last_sequence from checkpoint),0)), '[]'::jsonb) as events,
        coalesce((select jsonb_agg(state order by actor_id) from actor_runtime_state where session_id=${sessionId}), '[]'::jsonb) as actors,
        coalesce((select jsonb_agg(state order by id) from encounters where session_id=${sessionId}), '[]'::jsonb) as encounters
    `)[0]! as unknown as RuntimeRows & { checkpoint: Checkpoint | null };
    const report = compare(row, row.checkpoint ?? undefined).report;
    return { ...report, snapshotSequence: Number(row.checkpoint?.last_sequence ?? 0), replayedEventCount: row.events.length };
  }

  async repairFinishedSession(sessionId: string) {
    return this.sql.begin(async tx => {
      await tx`set local lock_timeout = '5s'`;
      // This operator-only operation briefly blocks all runtime writes so the replay target cannot move.
      await tx`lock table game_events, actor_runtime_state, encounters in share row exclusive mode`;
      const session = (await tx`select state from sessions where id=${sessionId} for update`)[0];
      if (session?.state !== "finished") throw Object.assign(Error("repair requires a finished session"), { statusCode: 409 });
      const row = (await tx`
        select
          coalesce((select jsonb_agg(jsonb_build_object('sequence',sequence,'type',event_type,'payload',payload,'schemaVersion',schema_version) order by sequence) from game_events where session_id=${sessionId}), '[]'::jsonb) as events,
          coalesce((select jsonb_agg(state order by actor_id) from actor_runtime_state where session_id=${sessionId}), '[]'::jsonb) as actors,
          coalesce((select jsonb_agg(state order by id) from encounters where session_id=${sessionId}), '[]'::jsonb) as encounters
      `)[0]! as unknown as RuntimeRows;
      const { report, replayed } = compare(row);
      if (report.issues.length) throw Object.assign(Error("runtime events cannot be replayed"), { statusCode: 409, report });
      if (report.matching) return { repaired: false, ...report };
      for (const actor of replayed.actors) await tx`
        insert into actor_runtime_state(session_id,actor_id,state) values(${sessionId},${actor.actorId},${tx.json(actor as unknown as Parameters<typeof tx.json>[0])})
        on conflict(session_id,actor_id) do update set state=excluded.state,version=actor_runtime_state.version+1,updated_at=now()`;
      const expectedActors = new Set(replayed.actors.map(actor => actor.actorId));
      for (const actor of row.actors) if (!expectedActors.has(actor.actorId)) await tx`delete from actor_runtime_state where session_id=${sessionId} and actor_id=${actor.actorId}`;
      for (const encounter of replayed.encounters) await tx`
        insert into encounters(id,session_id,state) values(${encounter.id},${sessionId},${tx.json(encounter as unknown as Parameters<typeof tx.json>[0])})
        on conflict(id) do update set state=excluded.state,version=encounters.version+1,updated_at=now()`;
      const expectedEncounters = new Set(replayed.encounters.map(encounter => encounter.id));
      for (const encounter of row.encounters) if (!expectedEncounters.has(encounter.id)) await tx`delete from encounters where session_id=${sessionId} and id=${encounter.id}`;
      const audit = (await tx`insert into runtime_repair_log(session_id,event_count,actor_ids,encounter_ids)
        values(${sessionId},${report.eventCount},${tx.json(report.actorIds)},${tx.json(report.encounterIds)}) returning id`)[0]!;
      return { repaired: true, auditId: audit.id, ...report };
    });
  }

  async close() { await this.sql.end(); }
}
