import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const base = process.env.MASTERHOST_API_URL ?? "http://127.0.0.1:8141/api";
const platform = process.env.MASTERHOST_PLATFORM_KEY ?? "m10-platform";
const stateFile = process.env.M10_STATE_FILE;
if (!stateFile) throw Error("M10_STATE_FILE is required");

async function call(path, { method = "GET", body, realm, token } = {}) {
  const response = await fetch(`${base}${path}`, { method, headers: { ...(realm ? { "x-realm-slug": realm } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { "content-type": "application/json" }) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await response.json(); return { response, data };
}
async function ok(path, options) { const result = await call(path, options); assert.ok(result.response.ok, `${options?.method ?? "GET"} ${path}: ${result.response.status} ${JSON.stringify(result.data)}`); return result.data; }
const auth = (realm, token, extra = {}) => ({ realm, token, ...extra });

if (process.env.M10_PHASE === "verify") {
  const state = JSON.parse(await readFile(stateFile, "utf8")), creator = auth(state.slug, state.creatorToken);
  const project = await ok(`/game-descriptors/${state.projectId}`, creator);
  assert.equal(project.revision, 2); assert.equal(project.selections.length, 2);
  const oldWorld = await ok(`/worlds/${state.oldWorldId}`, creator), recomposed = await ok(`/worlds/${state.worldId}`, creator);
  assert.equal(oldWorld.packVersion, "0.1.1"); assert.equal(recomposed.packVersion, "0.1.2");
  await ok(`/worlds/${oldWorld.id}/regenerate/preview`, { ...creator, method: "POST" });
  await ok(`/worlds/${recomposed.id}/regenerate/preview`, { ...creator, method: "POST" });
  const custom = recomposed.entities.find(value => value.materializationPath === state.customPath)?.values.name;
  assert.deepEqual(custom, { value: "Keeper's Observatory", source: "custom", locked: true });
  console.log("M10 restart acceptance passed: selections, both immutable composed Pack revisions and recomposed CUSTOM/LOCK state survived restart.");
  process.exit(0);
}

const created = await ok("/host/realms", { method: "POST", token: platform, body: { slug: "m10-dynamic", name: "M10 Dynamic Realm", quotas: { worlds: 10, packs: 10, activeSessions: 5, assetBytes: 1000000 } } });
const slug = created.realm.slug, adminToken = created.adminToken, realmId = created.realm.id;
const creatorMember = await ok(`/host/realms/${realmId}/members`, auth(slug, adminToken, { method: "POST", body: { name: "M10 Creator", role: "creator" } }));
const creator = auth(slug, creatorMember.accessToken);
let baseProject = await ok("/pack-projects", { ...creator, method: "POST", body: { id: "masterhost.m10-base", name: "M10 Base", version: "1.0.0", worldKind: "world", worldName: "The Chosen World", childKind: "location", childName: "First Haven" } });
baseProject.document.theme = { primary: "#123456", accent: "#abcdef", background: "#101820" };
baseProject.document.terminology = { world: "Domain", character: "Hero", gameMaster: "Keeper" };
baseProject = await ok(`/pack-projects/${baseProject.id}`, { ...creator, method: "PUT", body: { document: baseProject.document } });
baseProject = (await ok(`/pack-projects/${baseProject.id}/publish`, { ...creator, method: "POST" })).project;
await ok(`/host/realms/${realmId}`, auth(slug, adminToken, { method: "PUT", body: { activePack: { id: baseProject.document.manifest.id, version: baseProject.document.manifest.version } } }));

const fragments = await ok("/game-fragments", creator);
assert.deepEqual(fragments.map(value => value.id), ["masterhost.fragment.fortune", "masterhost.fragment.observatory"]);
const invalidType = await call("/game-descriptors", { ...creator, method: "POST", body: { name: "Invalid parameters", seed: "invalid", basePack: { id: baseProject.document.manifest.id, version: baseProject.document.manifest.version }, selections: [{ fragmentId: "masterhost.fragment.fortune", version: "1.0.0", parameters: { startingLuck: {} } }] } });
assert.equal(invalidType.response.status, 400); assert.match(invalidType.data.message, /must be scalar/);
const invalidPreview = await ok("/game-descriptors/preview", { ...creator, method: "POST", body: { name: "Invalid preview", seed: "invalid", basePack: { id: baseProject.document.manifest.id, version: baseProject.document.manifest.version }, selections: [{ fragmentId: "masterhost.fragment.observatory", version: "1.0.0", parameters: { danger: 9 } }] } });
assert.equal(invalidPreview.report.valid, false); assert.ok(invalidPreview.report.diagnostics.some(value => value.code === "parameter" && value.path.endsWith("parameters.danger")));
const selections = [
  { fragmentId: "masterhost.fragment.observatory", version: "1.0.0", parameters: { danger: 3 } },
  { fragmentId: "masterhost.fragment.fortune", version: "1.0.0", parameters: { startingLuck: 4 } },
];
let project = await ok("/game-descriptors", { ...creator, method: "POST", body: { name: "The Observatory Test", seed: "m10-seed", basePack: { id: baseProject.document.manifest.id, version: baseProject.document.manifest.version }, selections, decisions: { "world.tone": "dangerous" }, locks: ["world.tone"] } });
assert.equal(project.report.valid, true); assert.deepEqual(project.report.providedCapabilities, ["location:observatory", "rules:fortune"]);
const preview = await ok(`/game-descriptors/${project.id}/preview`, { ...creator, method: "POST" });
assert.equal(preview.report.valid, true); assert.equal(preview.document.manifest.version, "0.1.1");
assert.deepEqual(preview.document.theme, baseProject.document.theme); assert.deepEqual(preview.document.terminology, baseProject.document.terminology);
const first = await ok(`/game-descriptors/${project.id}/compile`, { ...creator, method: "POST" });
const second = await ok(`/game-descriptors/${project.id}/compile`, { ...creator, method: "POST" });
assert.deepEqual(first.entities.map(value => [value.materializationPath, value.values]), second.entities.map(value => [value.materializationPath, value.values]));
const observatory = first.entities.find(value => value.templateRef === "location.observatory"); assert.ok(observatory);
let customized = await ok(`/worlds/${first.id}/entities/${observatory.id}/values/name`, { ...creator, method: "PATCH", body: { mode: "custom", value: "Keeper's Observatory" } });
customized = await ok(`/worlds/${first.id}/entities/${observatory.id}/values/name`, { ...creator, method: "PATCH", body: { mode: "lock" } });
const updatedSelections = selections.map(value => value.fragmentId.includes("observatory") ? { ...value, parameters: { danger: 4 } } : value);
project = await ok(`/game-descriptors/${project.id}`, { ...creator, method: "PUT", body: { expectedRevision: 1, selections: updatedSelections, decisions: project.decisions, locks: project.locks, name: project.name, seed: project.seed } });
assert.equal(project.revision, 2); assert.equal(project.compiled.manifest.version, "0.1.2");
assert.equal((await call(`/game-descriptors/${project.id}`, { ...creator, method: "PUT", body: { expectedRevision: 1, selections, decisions: {}, locks: [], name: project.name, seed: project.seed } })).response.status, 409);
const impact = await ok(`/game-descriptors/${project.id}/worlds/${first.id}/recompose/preview`, { ...creator, method: "POST" }); assert.equal(impact.packVersion, "0.1.2");
const recomposed = await ok(`/game-descriptors/${project.id}/worlds/${first.id}/recompose`, { ...creator, method: "POST" });
assert.equal(recomposed.packVersion, "0.1.2"); assert.equal(recomposed.descriptor.composition.revision, 2);
const retained = recomposed.entities.find(value => value.materializationPath === observatory.materializationPath)?.values.name;
assert.deepEqual(retained, { value: "Keeper's Observatory", source: "custom", locked: true });
const officialRealm = await ok("/host/realms", { method: "POST", token: platform, body: { slug: "m10-official", name: "M10 Official Realm", quotas: { worlds: 10, packs: 10, activeSessions: 5, assetBytes: 1000000 } } });
const officialCreator = await ok(`/host/realms/${officialRealm.realm.id}/members`, auth(officialRealm.realm.slug, officialRealm.adminToken, { method: "POST", body: { name: "Official Creator", role: "creator" } }));
await ok(`/host/realms/${officialRealm.realm.id}`, auth(officialRealm.realm.slug, officialRealm.adminToken, { method: "PUT", body: { activePack: { id: "masterhost.space-opera", version: "1.0.0" } } }));
const officialGame = await ok("/game-descriptors", { ...auth(officialRealm.realm.slug, officialCreator.accessToken), method: "POST", body: { name: "Official Observatory", seed: "official-observatory", basePack: { id: "masterhost.space-opera", version: "1.0.0" }, selections: [{ fragmentId: "masterhost.fragment.observatory", version: "1.0.0", parameters: { danger: 4 } }], decisions: {}, locks: [] } });
assert.ok(Object.keys(officialGame.compiled.assets).length >= 5); assert.ok(Object.keys(officialGame.compiled.content.templates).length >= 10); assert.equal(officialGame.compiled.theme.primary, officialRealm.realm.brand.theme.primary);
await ok(`/game-descriptors/${officialGame.id}/compile`, { ...auth(officialRealm.realm.slug, officialCreator.accessToken), method: "POST" });
await writeFile(stateFile, JSON.stringify({ slug, creatorToken: creatorMember.accessToken, projectId: project.id, oldWorldId: second.id, worldId: recomposed.id, customPath: observatory.materializationPath }));
console.log("M10 live acceptance passed: published and installed official base Packs retained their complete content, fragment selection remained deterministic, stale writes failed and CUSTOM/LOCK recomposition passed.");
