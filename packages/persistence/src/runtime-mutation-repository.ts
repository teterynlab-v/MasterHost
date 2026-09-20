import postgres from "postgres";
import type { ActorRuntimeState, Encounter } from "@masterhost/game-runtime";

export interface RuntimeMutationEvent { type: string; payload: Record<string, unknown> }
export interface RuntimeMutationVersions { actorVersions?: Record<string, number>; encounterVersion?: number }
const conflict = () => Object.assign(Error("runtime state changed; reload and retry"), { statusCode: 409 });

export class RuntimeMutationRepository {
  private sql;
  constructor(url: string) { this.sql = postgres(url); }

  async commit(sessionId: string, events: RuntimeMutationEvent[], states: ActorRuntimeState[] = [], encounter?: Encounter, versions: RuntimeMutationVersions = {}) {
    await this.sql.begin(async tx => {
      if (versions.actorVersions) {
        const rows = await tx`select actor_id,version from actor_runtime_state where session_id=${sessionId} order by actor_id for update`;
        if (rows.length !== Object.keys(versions.actorVersions).length || rows.some(row => versions.actorVersions![row.actor_id as string] !== Number(row.version))) throw conflict();
      }
      if (encounter) {
        if (versions.encounterVersion === undefined) {
          const inserted = await tx`insert into encounters(id,session_id,state) values(${encounter.id},${sessionId},${tx.json(encounter as unknown as Parameters<typeof tx.json>[0])}) on conflict(id) do nothing returning id`;
          if (!inserted.length) throw conflict();
        } else {
          const updated = await tx`update encounters set state=${tx.json(encounter as unknown as Parameters<typeof tx.json>[0])},version=version+1,updated_at=now() where id=${encounter.id} and session_id=${sessionId} and version=${versions.encounterVersion} returning id`;
          if (!updated.length) throw conflict();
        }
      }
      for (const state of states) {
        if (versions.actorVersions) {
          const expected = versions.actorVersions[state.actorId];
          if (expected === undefined) throw conflict();
          const updated = await tx`update actor_runtime_state set state=${tx.json(state as unknown as Parameters<typeof tx.json>[0])},version=version+1,updated_at=now() where session_id=${sessionId} and actor_id=${state.actorId} and version=${expected} returning actor_id`;
          if (!updated.length) throw conflict();
        } else {
          const inserted = await tx`insert into actor_runtime_state(session_id,actor_id,state) values(${sessionId},${state.actorId},${tx.json(state as unknown as Parameters<typeof tx.json>[0])}) on conflict(session_id,actor_id) do nothing returning actor_id`;
          if (!inserted.length) throw conflict();
        }
      }
      for (const event of events) await tx`insert into game_events(id,session_id,event_type,payload,schema_version) values(gen_random_uuid(),${sessionId},${event.type},${tx.json(event.payload as Parameters<typeof tx.json>[0])},'1')`;
    });
  }
  async close() { await this.sql.end(); }
}
