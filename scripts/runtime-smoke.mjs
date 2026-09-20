import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const base = process.env.MASTERHOST_API_URL ?? "http://localhost:8080/api";
async function call(path, body, token) {
  const response = await fetch(`${base}${path}`, { method: body === undefined ? "GET" : "POST", headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
const valid = async (path, body, token) => { const result = await call(path, body, token); assert.ok(result.status >= 200 && result.status < 300, `${path}: ${result.status} ${JSON.stringify(result.data)}`); return result.data; };

const pack = await valid("/pack");
assert.equal(pack.manifest.id, "masterhost.classic-fantasy-test");
const world = await valid("/worlds", { seed: "runtime-smoke", choices: {} });
const campaign = await valid("/campaigns", { worldId: world.id, name: "Runtime smoke" });
assert.equal((await call(`/campaigns/${campaign.id}/sessions`, {})).status, 403);
const session = await valid(`/campaigns/${campaign.id}/sessions`, {}, campaign.gmToken);
assert.match(session.pin, /^\d{5}$/);
assert.equal((await valid("/join/resolve", { pin: session.pin })).session.id, session.id);
const player = await valid(`/sessions/${session.id}/join`, { displayName: "Smoke player" });
const ownerKey = randomUUID();
assert.equal((await call("/characters", { ownerKey, values: { name: "Aria", archetype: "invalid" } })).status, 400);
const character = await valid("/characters", { ownerKey, values: { name: "Aria", archetype: "warrior" } });
assert.equal((await call(`/participants/${player.id}/character`, { characterId: character.id, ownerKey: "wrong" })).status, 403);
await valid(`/participants/${player.id}/character`, { characterId: character.id, ownerKey });
await valid(`/participants/${player.id}/ready`, { ready: true });
assert.equal((await call(`/sessions/${session.id}/state`, { state: "live" })).status, 403);
await valid(`/sessions/${session.id}/state`, { state: "live" }, campaign.gmToken);
assert.equal((await call("/join/resolve", { pin: session.pin })).status, 200);
await valid(`/sessions/${session.id}/participants/${player.id}/initialize`, {}, campaign.gmToken);
assert.equal((await call(`/sessions/${session.id}/actions`, { actorId: player.id, targetActorIds: [randomUUID()], actionId: "take-damage" }, campaign.gmToken)).status, 400);
await valid(`/sessions/${session.id}/actions`, { actorId: player.id, targetActorIds: [player.id], actionId: "take-damage" }, campaign.gmToken);
await valid(`/sessions/${session.id}/actions`, { actorId: player.id, targetActorIds: [player.id], actionId: "poison" }, campaign.gmToken);
const before = await valid(`/sessions/${session.id}/actors`);
assert.equal(before[0].resources.health, 15);
assert.equal(before[0].effects[0].remaining, 3);
const encounter = await valid(`/sessions/${session.id}/encounters`, { participantIds: [player.id] }, campaign.gmToken);
assert.equal(encounter.encounter.orderingPolicy, "fixed");
for (let i = 0; i < 3; i++) await valid(`/encounters/${encounter.encounter.id}/advance`, {}, campaign.gmToken);
const after = await valid(`/sessions/${session.id}/actors`);
assert.equal(after[0].effects.length, 0);
const events = await valid(`/sessions/${session.id}/events`);
for (const type of ["ActionRequested", "ResourceChanged", "EffectApplied", "EncounterStarted", "RoundStarted", "TurnStarted", "EffectTicked", "EffectExpired"]) assert.ok(events.some(event => event.type === type), `${type} missing`);
await valid(`/encounters/${encounter.encounter.id}/end`, {}, campaign.gmToken);
await valid(`/sessions/${session.id}/state`, { state: "finished" }, campaign.gmToken);
assert.equal((await call("/join/resolve", { pin: session.pin })).status, 404);
console.log("Runtime smoke passed: world, PIN, guest character, GM authorization, action, encounter, effect lifecycle, expiry.");
