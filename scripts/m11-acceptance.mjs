import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const base = process.env.MASTERHOST_API_URL ?? "http://127.0.0.1:8151/api";
const platform = process.env.MASTERHOST_PLATFORM_KEY ?? "m11-platform";
const stateFile = process.env.M11_STATE_FILE;
if (!stateFile) throw Error("M11_STATE_FILE is required");
const sha = value => createHash("sha256").update(value).digest("hex");

async function call(path, { method = "GET", body, realm, token } = {}) {
  const response = await fetch(`${base}${path}`, { method, headers: { ...(realm ? { "x-realm-slug": realm } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { "content-type": "application/json" }) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = response.headers.get("content-type")?.includes("json") ? await response.json() : Buffer.from(await response.arrayBuffer());
  return { response, data };
}
async function ok(path, options) { const result = await call(path, options); assert.ok(result.response.ok, `${options?.method ?? "GET"} ${path}: ${result.response.status} ${Buffer.isBuffer(result.data) ? "binary" : JSON.stringify(result.data)}`); return result.data; }
const auth = (realm, token, extra = {}) => ({ realm, token, ...extra });

if (process.env.M11_PHASE === "verify") {
  const state = JSON.parse(await readFile(stateFile, "utf8")), creator = auth(state.slug, state.creatorToken);
  const project = await ok(`/game-descriptors/${state.projectId}`, creator), world = await ok(`/worlds/${state.worldId}`, creator);
  assert.equal(project.selections.length, 9); assert.equal(project.compiled.manifest.defaultArtSet, "voidwake"); assert.equal(world.packId, project.compiled.manifest.id);
  for (const media of state.media) { const bytes = await ok(`/worlds/${world.id}/pack-assets/${media.name.split("/").map(encodeURIComponent).join("/")}`, creator); assert.equal(bytes.length, media.size); assert.equal(sha(bytes), media.checksum); }
  await ok(`/worlds/${world.id}/regenerate/preview`, { ...creator, method: "POST" });
  console.log("M11 restart acceptance passed: composed Descriptor, World and all immutable library media resolved from PostgreSQL revision state after restart.");
  process.exit(0);
}

const created = await ok("/host/realms", { method: "POST", token: platform, body: { slug: "m11-assets", name: "M11 Asset Realm", quotas: { worlds: 20, packs: 20, activeSessions: 5, assetBytes: 2000000 } } });
const slug = created.realm.slug, realmId = created.realm.id;
const member = await ok(`/host/realms/${realmId}/members`, auth(slug, created.adminToken, { method: "POST", body: { name: "M11 Creator", role: "creator" } })), creator = auth(slug, member.accessToken);
await ok(`/host/realms/${realmId}`, auth(slug, created.adminToken, { method: "PUT", body: { activePack: { id: "masterhost.space-opera", version: "1.0.0" } } }));

const assets = await ok("/game-assets?basePackId=masterhost.space-opera", creator);
assert.equal(assets.length, 9); assert.deepEqual([...new Set(assets.map(value => value.license.spdx))], ["CC-BY-4.0"]); assert.equal(assets.reduce((sum, value) => sum + value.counts.locations, 0), 10); assert.equal(assets.reduce((sum, value) => sum + value.counts.actors, 0), 20); assert.equal(assets.reduce((sum, value) => sum + value.counts.items, 0), 20); assert.equal(assets.reduce((sum, value) => sum + value.counts.scenes, 0), 12); assert.equal(assets.reduce((sum, value) => sum + value.counts.archetypes, 0), 6); assert.ok(assets.every(value => /^[a-f0-9]{64}$/.test(value.contentChecksum)));
const filtered = await ok("/game-assets?basePackId=masterhost.space-opera&type=visuals&tag=voidwake", creator); assert.equal(filtered.length, 1);
const detail = await ok(`/game-assets/${filtered[0].id}/${filtered[0].version}`, creator); assert.equal(detail.media.length, 8);
for (const asset of assets) for (const dependency of asset.dependencies) assert.ok(assets.some(value => value.id === dependency.id && value.version === dependency.version));
for (const media of detail.media) { const denied = await call(`/game-assets/media/${media.checksum}/${media.name.split("/").map(encodeURIComponent).join("/")}`, { realm: slug }); assert.equal(denied.response.status, 403); const bytes = await ok(`/game-assets/media/${media.checksum}/${media.name.split("/").map(encodeURIComponent).join("/")}`, creator); assert.equal(bytes.length, media.size); assert.equal(sha(bytes), media.checksum); }

const order = ["setting", "world-template", "locations", "cast", "items", "rules", "characters", "adventure", "visuals"], selections = order.map(type => { const asset = assets.find(value => value.type === type); assert.ok(asset, type); return { fragmentId: asset.id, version: asset.version, parameters: {} }; });
const payload = { name: "Voidwake: The Drowned Engine", seed: "m11-voidwake", basePack: { id: "masterhost.space-opera", version: "1.0.0" }, selections, decisions: {}, locks: [] };
const missingDependency = await ok("/game-descriptors/preview", { ...creator, method: "POST", body: { ...payload, selections: selections.filter(value => value.fragmentId !== "masterhost.asset.voidwake.setting") } }); assert.equal(missingDependency.report.valid, false); assert.ok(missingDependency.report.diagnostics.some(value => /missing exact asset dependency/.test(value.message)));
const incompatibleRealm = await ok("/host/realms", { method: "POST", token: platform, body: { slug: "m11-incompatible", name: "M11 Incompatible Realm", quotas: { worlds: 5, packs: 5, activeSessions: 2, assetBytes: 1000000 } } }), incompatibleMember = await ok(`/host/realms/${incompatibleRealm.realm.id}/members`, auth(incompatibleRealm.realm.slug, incompatibleRealm.adminToken, { method: "POST", body: { name: "M11 Incompatible Creator", role: "creator" } }));
await ok(`/host/realms/${incompatibleRealm.realm.id}`, auth(incompatibleRealm.realm.slug, incompatibleRealm.adminToken, { method: "PUT", body: { activePack: { id: "masterhost.classic-fantasy", version: "1.0.0" } } }));
const incompatible = await ok("/game-descriptors/preview", { ...auth(incompatibleRealm.realm.slug, incompatibleMember.accessToken), method: "POST", body: { ...payload, basePack: { id: "masterhost.classic-fantasy", version: "1.0.0" } } }); assert.equal(incompatible.report.valid, false); assert.ok(incompatible.report.diagnostics.some(value => /not compatible with base Pack masterhost.classic-fantasy/.test(value.message)));
const preview = await ok("/game-descriptors/preview", { ...creator, method: "POST", body: payload }); assert.equal(preview.report.valid, true); assert.equal(preview.document.manifest.defaultArtSet, "voidwake"); assert.equal(Object.keys(preview.document.assets).filter(name => name.startsWith("voidwake/")).length, 8);
const project = await ok("/game-descriptors", { ...creator, method: "POST", body: payload }), first = await ok(`/game-descriptors/${project.id}/compile`, { ...creator, method: "POST" }), second = await ok(`/game-descriptors/${project.id}/compile`, { ...creator, method: "POST" });
assert.deepEqual(first.entities.map(value => [value.materializationPath, value.templateRef, value.values]), second.entities.map(value => [value.materializationPath, value.templateRef, value.values]));
assert.equal(first.entities.filter(value => value.templateRef?.startsWith("voidwake.location.")).length, 10); assert.equal(first.entities.filter(value => value.templateRef?.startsWith("voidwake.actor.")).length, 20); assert.equal(first.entities.filter(value => value.templateRef?.startsWith("voidwake.scene.")).length, 12);
await writeFile(stateFile, JSON.stringify({ slug, creatorToken: member.accessToken, projectId: project.id, worldId: first.id, media: detail.media }));
console.log("M11 live acceptance passed: creator selected 9 licensed assets, composed a complete deterministic one-shot, materialized 42 scenario entities and fetched all 8 verified media files.");
