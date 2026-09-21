import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const base = process.env.MASTERHOST_API_URL ?? "http://127.0.0.1:8161/api", platform = process.env.MASTERHOST_PLATFORM_KEY ?? "m12-platform", stateFile = process.env.M12_STATE_FILE;
if (!stateFile) throw Error("M12_STATE_FILE is required");
async function call(path, { method = "GET", body, realm, token } = {}) { const response = await fetch(`${base}${path}`, { method, headers: { ...(realm ? { "x-realm-slug": realm } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { "content-type": "application/json" }) }, body: body === undefined ? undefined : JSON.stringify(body) }); const data = await response.json(); return { response, data }; }
async function ok(path, options) { const result = await call(path, options); assert.ok(result.response.ok, `${options?.method ?? "GET"} ${path}: ${result.response.status} ${JSON.stringify(result.data)}`); return result.data; }
const auth = (realm, token, extra = {}) => ({ realm, token, ...extra });

if (process.env.M12_PHASE === "verify") {
  const state = JSON.parse(await readFile(stateFile, "utf8")), creator = auth(state.slug, state.creatorToken), project = await ok(`/game-descriptors/${state.projectId}`, creator), world = await ok(`/worlds/${state.worldId}`, creator);
  assert.equal(project.selections.length, 9); assert.equal(project.report.valid, true); assert.equal(world.packId, project.compiled.manifest.id); assert.equal(world.entities.filter(value => value.templateRef?.startsWith("voidwake.scene.")).length, 12);
  const review = await ok("/game-assets/quick-review", { ...creator, method: "POST", body: { basePack: project.basePack, selections: project.selections.map(value => ({ id: value.fragmentId, version: value.version })) } }); assert.equal(review.ready, true);
  console.log("M12 restart acceptance passed: reviewed selections, Descriptor project and playable World survived restart."); process.exit(0);
}

const created = await ok("/host/realms", { method: "POST", token: platform, body: { slug: "m12-quick", name: "M12 Quick Realm", quotas: { worlds: 20, packs: 20, activeSessions: 5, assetBytes: 2000000 } } }), slug = created.realm.slug, realmId = created.realm.id;
const member = await ok(`/host/realms/${realmId}/members`, auth(slug, created.adminToken, { method: "POST", body: { name: "M12 Creator", role: "creator" } })), creator = auth(slug, member.accessToken);
await ok(`/host/realms/${realmId}`, auth(slug, created.adminToken, { method: "PUT", body: { activePack: { id: "masterhost.space-opera", version: "1.0.0" } } }));
const assets = await ok("/game-assets?basePackId=masterhost.space-opera", creator), identities = assets.map(value => ({ id: value.id, version: value.version }));
const denied = await call("/game-assets/quick-review", { realm: slug, method: "POST", body: { basePack: { id: "masterhost.space-opera", version: "1.0.0" }, selections: identities } }); assert.equal(denied.response.status, 403);
const wrongPack = await call("/game-assets/quick-review", { ...creator, method: "POST", body: { basePack: { id: "masterhost.classic-fantasy", version: "1.0.0" }, selections: identities } }); assert.equal(wrongPack.response.status, 409);
const incomplete = await ok("/game-assets/quick-review", { ...creator, method: "POST", body: { basePack: { id: "masterhost.space-opera", version: "1.0.0" }, selections: identities.filter(value => !value.id.endsWith(".setting")) } }); assert.equal(incomplete.ready, false); assert.ok(incomplete.diagnostics.some(value => value.code === "missing-category")); assert.ok(incomplete.diagnostics.some(value => value.code === "missing-dependency"));
const review = await ok("/game-assets/quick-review", { ...creator, method: "POST", body: { basePack: { id: "masterhost.space-opera", version: "1.0.0" }, selections: identities.reverse() } });
assert.equal(review.ready, true); assert.equal(review.selected.length, 9); assert.equal(review.orderedSelections[0].id, "masterhost.asset.voidwake.setting"); assert.deepEqual(review.counts, { locations: 10, actors: 20, items: 20, scenes: 12, archetypes: 6, rules: 15, media: 8 }); assert.equal(review.licenses.length, 9);
const selections = review.orderedSelections.map(value => ({ fragmentId: value.id, version: value.version, parameters: {} })), payload = { name: "Voidwake Quick One-shot", seed: "m12-quick", basePack: { id: "masterhost.space-opera", version: "1.0.0" }, selections, decisions: { "world.tone": "tense", "world.threat": "high", "world.environment": "frontier", "world.scarcity": "rationed" }, locks: [] };
const preview = await ok("/game-descriptors/preview", { ...creator, method: "POST", body: payload }); assert.equal(preview.report.valid, true);
const project = await ok("/game-descriptors", { ...creator, method: "POST", body: payload }), world = await ok(`/game-descriptors/${project.id}/compile`, { ...creator, method: "POST" });
assert.equal(world.entities.filter(value => value.templateRef?.startsWith("voidwake.location.")).length, 10); assert.equal(world.entities.filter(value => value.templateRef?.startsWith("voidwake.actor.")).length, 20); assert.equal(world.entities.filter(value => value.templateRef?.startsWith("voidwake.scene.")).length, 12);
const browserRealm = await ok("/host/realms", { method: "POST", token: platform, body: { slug: "m12-browser", name: "M12 Browser Realm", quotas: { worlds: 20, packs: 20, activeSessions: 5, assetBytes: 2000000 } } }), browserMember = await ok(`/host/realms/${browserRealm.realm.id}/members`, auth(browserRealm.realm.slug, browserRealm.adminToken, { method: "POST", body: { name: "M12 Browser Creator", role: "creator" } }));
await ok(`/host/realms/${browserRealm.realm.id}`, auth(browserRealm.realm.slug, browserRealm.adminToken, { method: "PUT", body: { activePack: { id: "masterhost.space-opera", version: "1.0.0" } } }));
await writeFile(stateFile, JSON.stringify({ slug, creatorToken: member.accessToken, projectId: project.id, worldId: world.id, browserSlug: browserRealm.realm.slug, browserToken: browserMember.accessToken }));
console.log("M12 API acceptance passed: authorization, active-Pack binding, incomplete diagnostics, deterministic review, Descriptor preview and playable compilation.");
