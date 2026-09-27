import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const base = process.env.MASTERHOST_API_URL, phase = process.env.M28_PHASE, stateFile = process.env.M28_STATE_FILE, archiveFile = process.env.M28_ARCHIVE_FILE;
if (!base || !phase || !stateFile || !archiveFile) throw Error("M28 environment is incomplete");
const headers = { "x-realm-slug": "default", authorization: "Bearer local-default-realm-admin" };
async function call(path, { method = "GET", body, binary = false } = {}) { const response = await fetch(`${base}${path}`, { method, headers: { ...headers, ...(body === undefined ? {} : { "content-type": binary ? "application/vnd.masterhost.game+zip" : "application/json" }) }, body: body === undefined ? undefined : binary ? body : JSON.stringify(body) }); const bytes = new Uint8Array(await response.arrayBuffer()), text = new TextDecoder().decode(bytes); return { response, bytes, data: response.headers.get("content-type")?.includes("json") && text ? JSON.parse(text) : text }; }
async function ok(path, options) { const result = await call(path, options); assert.ok(result.response.ok, `${options?.method ?? "GET"} ${path}: ${result.response.status} ${JSON.stringify(result.data)}`); return result; }
const canonical = world => JSON.parse(JSON.stringify({ seed: world.seed, packId: world.packId, packVersion: world.packVersion, descriptor: world.descriptor, entities: world.entities.map(value => ({ path: value.materializationPath, kind: value.kind, values: value.values, tags: value.tags, traits: value.traits, assets: value.assets })) }));

if (phase === "export") {
  const universe = (await ok("/universes/age-of-sail")).data;
  assert.deepEqual({ availability: universe.availability, targetPack: universe.targetPack, playToday: universe.playToday }, { availability: "ready", targetPack: { id: "masterhost.age-of-sail", version: "1.0.0" }, playToday: { patternId: "pirate-archipelago", campaignKitId: "kit.pirate-archipelago", visualThemeId: "visualThemes.1" } });
  await ok("/host/realms/00000000-0000-0000-0000-000000000001", { method: "PUT", body: { activePack: universe.targetPack } });
  const pack = (await ok("/pack")).data; assert.deepEqual(pack.manifest, expectIdentity("masterhost.age-of-sail", "1.0.0", pack.manifest));
  const assets = (await ok("/game-assets?basePackId=masterhost.age-of-sail")).data.filter(value => value.id.startsWith("masterhost.asset.sail.")); assert.equal(assets.length, 9);
  const identities = assets.map(value => ({ id: value.id, version: value.version })), review = (await ok("/game-assets/quick-review", { method: "POST", body: { basePack: universe.targetPack, selections: identities } })).data; assert.equal(review.ready, true); assert.equal(review.selected.length, 9);
  const selections = review.orderedSelections.map(value => ({ fragmentId: value.id, version: value.version, parameters: {} }));
  const incompatible = await ok("/game-descriptors/preview", { method: "POST", body: { name: "Incompatible preview", basePack: universe.targetPack, selections, decisions: { "world.pattern": "imperial-trade-war", "world.campaignKit": "kit.mythic-ocean", "world.visualTheme": "visualThemes.1" } } }); assert.equal(incompatible.data.report.valid, false); assert.ok(incompatible.data.report.diagnostics.some(value => value.path === "world.campaignKit")); assert.ok(incompatible.data.report.diagnostics.some(value => value.path === "world.visualTheme"));
  const decisions = { "world.tone": "heroic", "world.threat": "high", "world.environment": "coves", "world.scarcity": "plentiful", "world.pattern": universe.playToday.patternId, "world.campaignKit": universe.playToday.campaignKitId, "world.visualTheme": universe.playToday.visualThemeId };
  const descriptor = (await ok("/game-descriptors", { method: "POST", body: { name: "Pirate Archipelago: Boats for the Next Storm", seed: "m28-first-oath", basePack: universe.targetPack, selections, decisions, locks: [] } })).data;
  const existingPreview = await ok(`/game-descriptors/${descriptor.id}/preview`, { method: "POST", body: { name: descriptor.name, seed: descriptor.seed, selections, decisions: { ...decisions, "world.pattern": "imperial-trade-war", "world.campaignKit": "kit.mythic-ocean", "world.visualTheme": "visualThemes.1" }, locks: [] } }); assert.equal(existingPreview.data.report.valid, false); assert.ok(existingPreview.data.report.diagnostics.some(value => value.path === "world.campaignKit")); assert.ok(existingPreview.data.report.diagnostics.some(value => value.path === "world.visualTheme"));
  const world = (await ok(`/game-descriptors/${descriptor.id}/compile`, { method: "POST" })).data; assert.equal(world.packId.startsWith("masterhost.game."), true); assert.ok(world.entities.length >= 20); assert.deepEqual(Object.fromEntries(Object.entries(world.descriptor.decisions).filter(([key]) => key.startsWith("world.pattern") || key.startsWith("world.campaignKit") || key.startsWith("world.visualTheme")).map(([key, value]) => [key, value.value])), { "world.pattern": "pirate-archipelago", "world.campaignKit": "kit.pirate-archipelago", "world.visualTheme": "visualThemes.1" });
  assert.equal(world.name, descriptor.name); assert.equal(world.entities.filter(value => value.kind === "campaign-kit").length, 1); assert.equal(world.entities.filter(value => value.kind === "scene").length, 6); assert.ok(world.entities.filter(value => value.kind === "npc").length >= 8); assert.ok(world.entities.filter(value => value.kind === "item").length >= 8); assert.ok(world.entities.some(value => value.values?.name?.value === "Lifeboats behind Chains"));
  const exported = await ok(`/worlds/${world.id}/export-game`); assert.equal(exported.response.headers.get("content-type"), "application/vnd.masterhost.game+zip"); assert.ok(exported.bytes.length > 5000);
  await writeFile(archiveFile, exported.bytes); await writeFile(stateFile, JSON.stringify({ source: canonical(world), sourceWorldId: world.id, assetCount: assets.length }));
  console.log("M28 installation A passed: ready catalog, exact activation, nine-asset Quick review, Advanced composition, World compilation and .mhgame export.");
} else if (phase === "import") {
  const archive = await readFile(archiveFile), source = JSON.parse(await readFile(stateFile, "utf8")), installed = (await ok("/games/import", { method: "POST", body: archive, binary: true })).data;
  const world = (await ok(`/worlds/${installed.worldId}`)).data, pack = (await ok("/pack")).data, evidence = (await ok(`/games/imports/${world.id}`)).data;
  assert.deepEqual(canonical(world), source.source); assert.deepEqual({ id: pack.manifest.id, version: pack.manifest.version }, installed.runtimePack); assert.equal(evidence.evidence.gameAssets.length, source.assetCount); assert.equal(pack.manifest.name, "Pirate Archipelago: Boats for the Next Storm");
  await writeFile(stateFile, JSON.stringify({ ...source, installed }));
  console.log("M28 installation B passed: self-contained .mhgame import retained exact World, runtime Pack, assets and evidence.");
} else if (phase === "verify") {
  const state = JSON.parse(await readFile(stateFile, "utf8")), world = (await ok(`/worlds/${state.installed.worldId}`)).data, pack = (await ok("/pack")).data;
  assert.deepEqual(canonical(world), state.source); assert.deepEqual({ id: pack.manifest.id, version: pack.manifest.version }, state.installed.runtimePack);
  console.log("M28 installation B restart readback passed for portable World and active runtime Pack.");
} else if (phase === "table-note") {
  const state=JSON.parse(await readFile(process.env.M28_TABLE_STATE_FILE,"utf8"));
  const r=await fetch(`${base}/sessions/${state.session.id}/table`,{headers:{"x-realm-slug":"default",authorization:`Bearer ${state.campaign.gmToken}`}});const table=await r.json();assert.ok(r.ok);
  const saved=await fetch(`${base}/sessions/${state.session.id}/table`,{method:"PATCH",headers:{"x-realm-slug":"default",authorization:`Bearer ${state.campaign.gmToken}`,"content-type":"application/json"},body:JSON.stringify({expectedRevision:table.revision,privateNote:"Browser-only ambush note"})});assert.ok(saved.ok);
  assert.equal(state.character.values.archetype,"archetypes.1");assert.equal(state.character.values.path,"progressionPaths.1");
  assert.ok(state.character.traits.includes("role-archetypes.1"));assert.ok(state.character.traits.includes("path-progressionPaths.1"));
  const progress=await fetch(`${base}/sessions/${state.session.id}/progression`,{method:"POST",headers:{"x-realm-slug":"default",authorization:`Bearer ${state.campaign.gmToken}`,"content-type":"application/json"},body:JSON.stringify({actorId:state.participant.id,progressionId:state.character.values.path,amount:1})});assert.ok(progress.ok);
  const actors=await fetch(`${base}/sessions/${state.session.id}/actors`,{headers:{"x-realm-slug":"default",authorization:`Bearer ${state.participant.accessToken}`}});assert.ok(actors.ok);assert.equal((await actors.json()).find(actor=>actor.actorId===state.participant.id).progression[state.character.values.path],1);
  const action=await fetch(`${base}/sessions/${state.session.id}/actions`,{method:"POST",headers:{"x-realm-slug":"default",authorization:`Bearer ${state.participant.accessToken}`,"content-type":"application/json"},body:JSON.stringify({actorId:state.participant.id,actionId:"recover",targetActorIds:[state.participant.id],inputs:{difficulty:5}})});assert.ok(action.ok);
} else throw Error(`Unknown M28_PHASE ${phase}`);

function expectIdentity(id, version, manifest) { return { ...manifest, id, version }; }
