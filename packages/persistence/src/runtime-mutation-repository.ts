import postgres from "postgres";
import type { ActorRuntimeState, Encounter } from "@masterhost/game-runtime";

export interface RuntimeMutationEvent { type: string; payload: Record<string, unknown> }
export class RuntimeMutationRepository {
  private sql;
  constructor(url: string) { this.sql = postgres(url); }
  async commit(sessionId: string, events: RuntimeMutationEvent[], states: ActorRuntimeState[] = [], encounter?: Encounter) {
    await this.sql.begin(async tx => {
      // postgres.js JSONValue requires an index signature; these domain objects are JSON data.
      for (const event of events) await tx`insert into game_events(id,session_id,event_type,payload,schema_version) values(gen_random_uuid(),${sessionId},${event.type},${tx.json(event.payload as Parameters<typeof tx.json>[0])},'1')`;
      for (const state of states) await tx`insert into actor_runtime_state(session_id,actor_id,state) values(${sessionId},${state.actorId},${tx.json(state as unknown as Parameters<typeof tx.json>[0])}) on conflict(session_id,actor_id) do update set state=excluded.state,updated_at=now()`;
      if (encounter) await tx`insert into encounters(id,session_id,state) values(${encounter.id},${sessionId},${tx.json(encounter as unknown as Parameters<typeof tx.json>[0])}) on conflict(id) do update set state=excluded.state,updated_at=now()`;
    });
  }
}
