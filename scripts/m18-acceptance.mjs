import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const base = process.env.MASTERHOST_API_URL, phase = process.env.M18_PHASE, stateFile = process.env.M18_STATE_FILE, archiveFile = process.env.M18_ARCHIVE_FILE;
if (!base || !phase || !stateFile || !archiveFile) throw Error("M18 environment is incomplete");
const headers = { "x-realm-slug": "default", authorization: "Bearer local-default-realm-admin" };
async function call(path, { method = "GET", body, binary = false } = {}) { const response = await fetch(`${base}${path}`, { method, headers: { ...headers, ...(body === undefined ? {} : { "content-type": binary ? "application/vnd.masterhost.game+zip" : "application/json" }) }, body: body === undefined ? undefined : binary ? body : JSON.stringify(body) }); const bytes = new Uint8Array(await response.arrayBuffer()), text = new TextDecoder().decode(bytes); return { response, bytes, data: response.headers.get("content-type")?.includes("json") && text ? JSON.parse(text) : text }; }
async function ok(path, options) { const result = await call(path, options); assert.ok(result.response.ok, `${options?.method ?? "GET"} ${path}: ${result.response.status} ${JSON.stringify(result.data)}`); return result; }
const canonical = world => JSON.parse(JSON.stringify({ seed: world.seed, packId: world.packId, packVersion: world.packVersion, descriptor: world.descriptor, entities: world.entities.map(value => ({ path: value.materializationPath, kind: value.kind, values: value.values, tags: value.tags, traits: value.traits, assets: value.assets })) }));

if (phase === "export") {
  const universe = (await ok("/universes/classic-fantasy")).data;
  assert.deepEqual({ availability: universe.availability, targetPack: universe.targetPack, playToday: universe.playToday }, { availability: "ready", targetPack: { id: "masterhost.classic-fantasy", version: "2.0.0" }, playToday: { patternId: "border-kingdoms", campaignKitId: "kit.border-kingdoms", visualThemeId: "visualThemes.1" } });
  await ok("/host/realms/00000000-0000-0000-0000-000000000001", { method: "PUT", body: { activePack: universe.targetPack } });
  const pack = (await ok("/pack")).data; assert.deepEqual(pack.manifest, expectIdentity("masterhost.classic-fantasy", "2.0.0", pack.manifest));
  const assets = (await ok("/game-assets?basePackId=masterhost.classic-fantasy")).data.filter(value => value.id.startsWith("masterhost.asset.classic.")); assert.equal(assets.length, 9);
  const identities = assets.map(value => ({ id: value.id, version: value.version })), review = (await ok("/game-assets/quick-review", { method: "POST", body: { basePack: universe.targetPack, selections: identities } })).data; assert.equal(review.ready, true); assert.equal(review.selected.length, 9);
  const selections = review.orderedSelections.map(value => ({ fragmentId: value.id, version: value.version, parameters: {} }));
  const descriptor = (await ok("/game-descriptors", { method: "POST", body: { name: "Border Kingdoms: The First Oath", seed: "m18-first-oath", basePack: universe.targetPack, selections, decisions: { "world.tone": "heroic", "world.threat": "high", "world.environment": "pastoral", "world.scarcity": "strained" }, locks: [] } })).data;
  const world = (await ok(`/game-descriptors/${descriptor.id}/compile`, { method: "POST" })).data; assert.equal(world.packId.startsWith("masterhost.game."), true); assert.ok(world.entities.length >= 20);
  const exported = await ok(`/worlds/${world.id}/export-game`); assert.equal(exported.response.headers.get("content-type"), "application/vnd.masterhost.game+zip"); assert.ok(exported.bytes.length > 5000);
  await writeFile(archiveFile, exported.bytes); await writeFile(stateFile, JSON.stringify({ source: canonical(world), sourceWorldId: world.id, assetCount: assets.length }));
  console.log("M18 installation A passed: ready catalog, exact activation, nine-asset Quick review, Advanced composition, World compilation and .mhgame export.");
} else if (phase === "import") {
  const archive = await readFile(archiveFile), source = JSON.parse(await readFile(stateFile, "utf8")), installed = (await ok("/games/import", { method: "POST", body: archive, binary: true })).data;
  const world = (await ok(`/worlds/${installed.worldId}`)).data, pack = (await ok("/pack")).data, evidence = (await ok(`/games/imports/${world.id}`)).data;
  assert.deepEqual(canonical(world), source.source); assert.deepEqual({ id: pack.manifest.id, version: pack.manifest.version }, installed.runtimePack); assert.equal(evidence.evidence.gameAssets.length, source.assetCount); assert.equal(pack.manifest.name, "Border Kingdoms: The First Oath");
  await writeFile(stateFile, JSON.stringify({ ...source, installed }));
  console.log("M18 installation B passed: self-contained .mhgame import retained exact World, runtime Pack, assets and evidence.");
} else if (phase === "verify") {
  const state = JSON.parse(await readFile(stateFile, "utf8")), world = (await ok(`/worlds/${state.installed.worldId}`)).data, pack = (await ok("/pack")).data;
  assert.deepEqual(canonical(world), state.source); assert.deepEqual({ id: pack.manifest.id, version: pack.manifest.version }, state.installed.runtimePack);
  console.log("M18 installation B restart readback passed for portable World and active runtime Pack.");
} else throw Error(`Unknown M18_PHASE ${phase}`);

function expectIdentity(id, version, manifest) { return { ...manifest, id, version }; }
