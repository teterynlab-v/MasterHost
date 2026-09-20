import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { ActorStateRepository, EncounterRepository, GameRepository, RuntimeMutationRepository, RuntimeReplayRepository } from "@masterhost/persistence";
import { advanceEncounter, endEncounter, startEncounter } from "@masterhost/game-runtime";

const url = process.env.DATABASE_URL ?? "postgresql://masterhost:masterhost@localhost:5432/masterhost";
const sql = postgres(url), actors = new ActorStateRepository(url), encounters = new EncounterRepository(url), game = new GameRepository(url), mutations = new RuntimeMutationRepository(url), replay = new RuntimeReplayRepository(url);
const sessionId = randomUUID(), actorId = randomUUID();
const isConflict = (reason: unknown) => reason instanceof Error && "statusCode" in reason && reason.statusCode === 409;

try {
  await game.migrate();
  await actors.migrate();
  await encounters.migrate();
  await mutations.migrate();
  const initial = { actorId, resources: { health: 20 }, effects: [] };
  await mutations.commit(sessionId, [{ type: "ActorInitialized", payload: { ...initial } }], [initial]);
  assert.equal((await replay.verify(sessionId)).matching, true);
  await sql`update actor_runtime_state set state=jsonb_set(state,'{resources,health}','19'::jsonb) where session_id=${sessionId} and actor_id=${actorId}`;
  assert.deepEqual((await replay.verify(sessionId)).actorIds, [actorId]);
  await sql`update actor_runtime_state set state=${sql.json(initial)} where session_id=${sessionId} and actor_id=${actorId}`;
  assert.equal((await replay.verify(sessionId)).matching, true);
  const [{ version: firstVersion }] = await actors.allVersioned(sessionId);
  const attempts = await Promise.allSettled([
    mutations.commit(sessionId, [{ type: "DamageA", payload: { actorId } }], [{ ...initial, resources: { health: 15 } }], undefined, { actorVersions: { [actorId]: firstVersion } }),
    mutations.commit(sessionId, [{ type: "DamageB", payload: { actorId } }], [{ ...initial, resources: { health: 12 } }], undefined, { actorVersions: { [actorId]: firstVersion } }),
  ]);
  assert.equal(attempts.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(attempts.filter(result => result.status === "rejected" && isConflict(result.reason)).length, 1);
  const damageEvents = (await game.events(sessionId)).filter(event => event.type === "DamageA" || event.type === "DamageB");
  assert.equal(damageEvents.length, 1);
  const current = (await actors.allVersioned(sessionId))[0];
  assert.equal(current.version, firstVersion + 1);
  assert.equal(current.state.resources.health, damageEvents[0].type === "DamageA" ? 15 : 12);
  const staleKey = randomUUID();
  await assert.rejects(
    mutations.commit(sessionId, [{ type: "StaleDamage", payload: { actorId } }], [{ ...current.state, resources: { health: 99 } }], undefined, { actorVersions: { [actorId]: firstVersion } }, { key: staleKey, fingerprint: "stale-request", result: { ok: true } }),
    isConflict,
  );
  assert.equal(await mutations.receipt(sessionId, staleKey, "stale-request"), undefined);

  const started = startEncounter({ sessionId, participantIds: [actorId], policy: "fixed" });
  await mutations.commit(sessionId, started.events, [], started.encounter);
  const saved = await encounters.getVersioned(started.encounter.id);
  assert.ok(saved);
  const advanced = advanceEncounter(saved.encounter, { [actorId]: current.state }, {});
  const actorVersions = { [actorId]: current.version };
  const turns = await Promise.allSettled([
    mutations.commit(sessionId, advanced.events, advanced.states, advanced.encounter, { actorVersions, encounterVersion: saved.version }),
    mutations.commit(sessionId, advanced.events, advanced.states, advanced.encounter, { actorVersions, encounterVersion: saved.version }),
  ]);
  assert.equal(turns.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(turns.filter(result => result.status === "rejected" && isConflict(result.reason)).length, 1);
  const afterTurn = await encounters.getVersioned(started.encounter.id);
  assert.equal(afterTurn?.encounter.turn, 2);
  assert.equal((await game.events(sessionId)).filter(event => event.type === "TurnEnded").length, 1);
  const ended = endEncounter(afterTurn!.encounter);
  await mutations.commit(sessionId, ended.events, [], ended.encounter, { encounterVersion: afterTurn!.version });
  assert.equal((await encounters.get(started.encounter.id))?.state, "ended");
  console.log("Concurrency smoke passed: stale writes rolled back and replay detected/restored a materialized-state mismatch.");
} finally {
  await sql`delete from game_events where session_id=${sessionId}`;
  await sql`delete from runtime_command_receipts where session_id=${sessionId}`;
  await sql`delete from encounters where session_id=${sessionId}`;
  await sql`delete from actor_runtime_state where session_id=${sessionId}`;
  await Promise.all([sql.end(), actors.close(), encounters.close(), game.close(), mutations.close(), replay.close()]);
}
