import { isDeepStrictEqual } from "node:util";
import postgres from "postgres";
import { replayRuntimeEvents } from "@masterhost/game-runtime";
import type { ActorRuntimeState, Encounter, ReplayEvent } from "@masterhost/game-runtime";

function mismatched<T>(expected: T[], actual: T[], id: (item: T) => string): string[] {
  const left = new Map(expected.map(item => [id(item), item]));
  const right = new Map(actual.map(item => [id(item), item]));
  const storedShape = (value: T | undefined) => value === undefined ? undefined : JSON.parse(JSON.stringify(value)) as T;
  return [...new Set([...left.keys(), ...right.keys()])].filter(key => !isDeepStrictEqual(storedShape(left.get(key)), storedShape(right.get(key)))).sort();
}

export class RuntimeReplayRepository {
  private sql;
  constructor(url: string) { this.sql = postgres(url); }

  async verify(sessionId: string) {
    // One SQL statement sees events and materialized rows at the same MVCC snapshot.
    const row = (await this.sql`
      select
        coalesce((select jsonb_agg(jsonb_build_object('sequence',sequence,'type',event_type,'payload',payload,'schemaVersion',schema_version) order by sequence) from game_events where session_id=${sessionId}), '[]'::jsonb) as events,
        coalesce((select jsonb_agg(state order by actor_id) from actor_runtime_state where session_id=${sessionId}), '[]'::jsonb) as actors,
        coalesce((select jsonb_agg(state order by id) from encounters where session_id=${sessionId}), '[]'::jsonb) as encounters
    `)[0]!;
    const events = row.events as ReplayEvent[];
    const replayed = replayRuntimeEvents(events);
    const actorIds = mismatched(replayed.actors, row.actors as ActorRuntimeState[], actor => actor.actorId);
    const encounterIds = mismatched(replayed.encounters, row.encounters as Encounter[], encounter => encounter.id);
    return { matching: replayed.issues.length === 0 && actorIds.length === 0 && encounterIds.length === 0, eventCount: events.length, actorIds, encounterIds, issues: replayed.issues };
  }

  async close() { await this.sql.end(); }
}
