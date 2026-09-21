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
const patch=async(path,body)=>{const response=await fetch(`${base}${path}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(body)}),data=await response.json();assert.ok(response.ok,`${path}: ${response.status} ${JSON.stringify(data)}`);return data};

const pack = await valid("/pack");
assert.equal(pack.manifest.id, "masterhost.cyberpunk-test");
const definitions = await valid("/game/definitions");
assert.equal(definitions.encounter.orderingPolicy, "none");
const world = await valid("/worlds", { seed: `cyberpunk-runtime-${randomUUID()}`, choices: {} });
const droneEntity = world.entities.find(entity => entity.kind === "actor");
assert.ok(droneEntity);
const campaign = await valid("/campaigns", { worldId: world.id, name: "Cyberpunk runtime smoke" });
const session = await valid(`/campaigns/${campaign.id}/sessions`, {}, campaign.gmToken);
const players = [];
for (const [name, role] of [["Neon", "solo"], ["Ghost", "netrunner"]]) {
  const player = await valid(`/sessions/${session.id}/join`, { pin: session.pin, displayName: name });
  const ownerKey = randomUUID();
  const character = await valid("/characters", { ownerKey, values: { name, role, interface: 2, awareness: 3 } });
  await valid(`/participants/${player.id}/character`, { characterId: character.id, ownerKey }, player.accessToken);
  await valid(`/participants/${player.id}/ready`, { ready: true }, player.accessToken);
  players.push(player);
}
await valid(`/sessions/${session.id}/state`, { state: "live" }, campaign.gmToken);
for (const player of players) await valid(`/sessions/${session.id}/participants/${player.id}/initialize`, {}, campaign.gmToken);
const checkBody = { participantId: players[0].id, checkId: "awareness", difficulty: 10 }, checkKey = randomUUID();
const checkAttempts = await Promise.all(Array.from({ length: 2 }, () => call(`/sessions/${session.id}/checks`, checkBody, campaign.gmToken, checkKey)));
assert.deepEqual(checkAttempts.map(result => result.status), [200, 200]);
assert.deepEqual(checkAttempts[0].data, checkAttempts[1].data);
const check = checkAttempts[0].data;
assert.equal((await call(`/sessions/${session.id}/checks`, { ...checkBody, difficulty: 11 }, campaign.gmToken, checkKey)).status, 409);
const checkRoll = await valid(`/checks/${check.id}/roll`, {}, players[0].accessToken);
assert.equal(checkRoll.modifier, 3);
assert.ok((await valid(`/sessions/${session.id}/world-actors`, undefined, campaign.gmToken)).some(entity => entity.id === droneEntity.id));
const droneKey = randomUUID(), droneBody = { templateId: "drone", worldEntityId: droneEntity.id };
const runtimeSnapshot = await valid(`/sessions/${session.id}/runtime/snapshots`, {}, campaign.gmToken);
assert.ok(runtimeSnapshot.lastSequence > 0);
const drone = await valid(`/sessions/${session.id}/actors`, droneBody, campaign.gmToken, droneKey);
assert.deepEqual(await valid(`/sessions/${session.id}/actors`, droneBody, campaign.gmToken, droneKey), drone);
assert.equal(drone.kind, "npc");
assert.equal(drone.worldEntityId, droneEntity.id);
assert.equal(drone.worldEntityPath,droneEntity.materializationPath);assert.equal(drone.worldEntityStatus,"current");assert.equal(drone.worldEntityRevision,world.revision);
assert.equal(drone.resources.ammo, 8);
assert.equal((await call(`/sessions/${session.id}/actors`, droneBody, campaign.gmToken)).status, 409);
const editedDrone=await valid(`/sessions/${session.id}/actors/${drone.actorId}/edit`,{label:"Sentinel Drone",attributes:{interface:2,awareness:4}},campaign.gmToken);assert.equal(editedDrone.label,"Sentinel Drone");assert.deepEqual(editedDrone.attributes,{interface:2,awareness:4});
const renamedWorld=await patch(`/worlds/${world.id}/values`,{entityId:droneEntity.id,key:"name",value:"Chrome Sentinel",locked:true}),reconciled=await valid(`/sessions/${session.id}/actors/reconcile-world`,{},campaign.gmToken,randomUUID());assert.deepEqual(reconciled,[{actorId:drone.actorId,status:"current",worldRevision:renamedWorld.revision,changed:true}]);const linked=(await valid(`/sessions/${session.id}/actors`,undefined,campaign.gmToken)).find(actor=>actor.actorId===drone.actorId);assert.equal(linked.label,"Sentinel Drone");assert.equal(linked.worldEntityLabel,"Chrome Sentinel");
assert.deepEqual(await valid(`/sessions/${session.id}/actors/reconcile-world`,{},campaign.gmToken),[{actorId:drone.actorId,status:"current",worldRevision:renamedWorld.revision,changed:false}]);
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
const roster = await valid(`/encounters/${started.encounter.id}/participants`, { addActorIds: [players[1].id], removeActorIds: [drone.actorId] }, campaign.gmToken);
assert.deepEqual(roster.encounter.participants, [players[0].id, players[1].id]);
assert.deepEqual(roster.encounter.order, []);
assert.equal((await call(`/encounters/${started.encounter.id}/advance`, {}, campaign.gmToken)).status, 400);
await valid(`/encounters/${started.encounter.id}/end`, {}, campaign.gmToken);
const removed=await valid(`/sessions/${session.id}/actors/${drone.actorId}/remove`,{},campaign.gmToken,randomUUID());assert.equal(removed.removedActorId,drone.actorId);
const events = await valid(`/sessions/${session.id}/events`, undefined, campaign.gmToken);
assert.equal(events.filter(event => event.type === "CheckRequested" && event.payload.id === check.id).length, 1);
assert.deepEqual(await valid(`/sessions/${session.id}/runtime/verify-checks`, undefined, campaign.gmToken), { matching: true, eventCount: events.length, checkIds: [], issues: [] });
assert.equal(events.filter(event => event.type === "EffectApplied").length, 2);
assert.ok(events.some(event => event.type === "EncounterStarted"));
assert.ok(events.some(event => event.type === "EncounterEnded"));
assert.ok(!events.some(event => event.type === "TurnStarted"));
assert.deepEqual(await valid(`/sessions/${session.id}/runtime/verify`, undefined, campaign.gmToken), { matching: true, eventCount: events.length, actorIds: [], encounterIds: [], issues: [] });
const snapshotVerification = await valid(`/sessions/${session.id}/runtime/verify-snapshot`, undefined, campaign.gmToken);
assert.equal(snapshotVerification.matching, true);
assert.equal(snapshotVerification.eventCount, events.length);
assert.equal(snapshotVerification.snapshotSequence, runtimeSnapshot.lastSequence);
await valid(`/sessions/${session.id}/state`, { state: "finished" }, campaign.gmToken);
assert.deepEqual(await valid(`/sessions/${session.id}/checks`, checkBody, campaign.gmToken, checkKey), check);
assert.equal((await call(`/sessions/${session.id}/actors`, { templateId: "drone" }, campaign.gmToken)).status, 409);
console.log("Cyberpunk runtime smoke passed: NPC action, two-target action, no-order encounter and effect events.");
