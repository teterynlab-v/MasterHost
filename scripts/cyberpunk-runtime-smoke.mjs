import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const base = process.env.MASTERHOST_API_URL ?? "http://localhost:8080/api";
async function call(path, body, token, key) {
  const response = await fetch(`${base}${path}`, { method: body === undefined ? "GET" : "POST", headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...(token ? { authorization: `Bearer ${token}` } : {}), ...(key ? { "idempotency-key": key } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
async function valid(path, body, token, key) {
  const result = await call(path, body, token, key);
  assert.ok(result.status >= 200 && result.status < 300, `${path}: ${result.status} ${JSON.stringify(result.data)}`);
  return result.data;
}

const pack = await valid("/pack");
assert.equal(pack.manifest.id, "masterhost.cyberpunk-test");
const definitions = await valid("/game/definitions");
assert.equal(definitions.encounter.orderingPolicy, "none");
const world = await valid("/worlds", { seed: `cyberpunk-runtime-${randomUUID()}`, choices: {} });
const campaign = await valid("/campaigns", { worldId: world.id, name: "Cyberpunk runtime smoke" });
const session = await valid(`/campaigns/${campaign.id}/sessions`, {}, campaign.gmToken);
const players = [];
for (const [name, role] of [["Neon", "solo"], ["Ghost", "netrunner"]]) {
  const player = await valid(`/sessions/${session.id}/join`, { pin: session.pin, displayName: name });
  const ownerKey = randomUUID();
  const character = await valid("/characters", { ownerKey, values: { name, role } });
  await valid(`/participants/${player.id}/character`, { characterId: character.id, ownerKey }, player.accessToken);
  await valid(`/participants/${player.id}/ready`, { ready: true }, player.accessToken);
  players.push(player);
}
await valid(`/sessions/${session.id}/state`, { state: "live" }, campaign.gmToken);
for (const player of players) await valid(`/sessions/${session.id}/participants/${player.id}/initialize`, {}, campaign.gmToken);
const droneKey = randomUUID(), droneBody = { templateId: "drone" };
const drone = await valid(`/sessions/${session.id}/actors`, droneBody, campaign.gmToken, droneKey);
assert.deepEqual(await valid(`/sessions/${session.id}/actors`, droneBody, campaign.gmToken, droneKey), drone);
assert.equal(drone.kind, "npc");
assert.equal(drone.resources.ammo, 8);
await valid(`/sessions/${session.id}/actions`, { actorId: drone.actorId, targetActorIds: [players[0].id], actionId: "damage" }, campaign.gmToken);
const signalBody = { actorId: players[0].id, targetActorIds: [players[0].id, drone.actorId], actionId: "signal-boost" }, signalKey = randomUUID();
const signalResult = await valid(`/sessions/${session.id}/actions`, signalBody, campaign.gmToken, signalKey);
assert.deepEqual(await valid(`/sessions/${session.id}/actions`, signalBody, campaign.gmToken, signalKey), signalResult);
const actors = await valid(`/sessions/${session.id}/actors`, undefined, players[0].accessToken);
for (const id of [players[0].id, drone.actorId]) assert.ok(actors.find(actor => actor.actorId === id).effects.some(effect => effect.definitionId === "boosted"));
assert.equal(actors.find(actor => actor.actorId === players[0].id).resources.health, 15);
const started = await valid(`/sessions/${session.id}/encounters`, { participantIds: [players[0].id, drone.actorId] }, campaign.gmToken);
assert.equal(started.encounter.orderingPolicy, "none");
assert.equal(started.encounter.currentActorId, undefined);
assert.equal((await call(`/encounters/${started.encounter.id}/advance`, {}, campaign.gmToken)).status, 400);
await valid(`/encounters/${started.encounter.id}/end`, {}, campaign.gmToken);
const events = await valid(`/sessions/${session.id}/events`, undefined, campaign.gmToken);
assert.equal(events.filter(event => event.type === "EffectApplied").length, 2);
assert.ok(events.some(event => event.type === "EncounterStarted"));
assert.ok(events.some(event => event.type === "EncounterEnded"));
assert.ok(!events.some(event => event.type === "TurnStarted"));
assert.deepEqual(await valid(`/sessions/${session.id}/runtime/verify`, undefined, campaign.gmToken), { matching: true, eventCount: events.length, actorIds: [], encounterIds: [], issues: [] });
await valid(`/sessions/${session.id}/state`, { state: "finished" }, campaign.gmToken);
assert.equal((await call(`/sessions/${session.id}/actors`, { templateId: "drone" }, campaign.gmToken)).status, 409);
console.log("Cyberpunk runtime smoke passed: NPC action, two-target action, no-order encounter and effect events.");
