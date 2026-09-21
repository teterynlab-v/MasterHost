import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { FastifyInstance } from "fastify";
import { buildDescriptor, composeGameDescriptor, fragmentCatalog, gameAssetCatalog, gameAssetDetail, gameAssetMedia, reviewQuickGameSelection, type GameAsset, type GameDescriptorFragment, type GameFragmentSelection, type QuickGameSelection } from "@masterhost/descriptor";
import type { DescriptorValue, MaterializedWorld } from "@masterhost/domain";
import { GameDescriptorRepository, PackProjectRepository, WorldRepository, type GameDescriptorProject } from "@masterhost/persistence";
import { toLoadedWorldPack, worldPackDocumentFromLoaded, type LoadedWorldPack, type WorldPackDocument } from "@masterhost/worldpack-sdk";
import { assertUniqueMaterializationPaths, compareWorlds, compileSatisfying, preserveCustomByPath } from "@masterhost/world-compiler";

interface Dependencies { descriptors: GameDescriptorRepository; worlds: WorldRepository; packs: PackProjectRepository; fragments: GameDescriptorFragment[]; assets: GameAsset[] }

const fail = (message: string, statusCode = 400) => Object.assign(Error(message), { statusCode });
const scalarRecord = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

export async function registerGameDescriptors(app: FastifyInstance, dependencies: Dependencies) {
  const assetIdentities = new Set(dependencies.assets.map(asset => `${asset.id}@${asset.version}`));
  const realmFor = async (request: any) => app.masterhostResolveRealm ? app.masterhostResolveRealm(request) : fail("Realm hosting is unavailable", 503) as never;
  const authorize = async (request: any) => {
    const realm = await realmFor(request), role = app.masterhostRole ? await app.masterhostRole(request, realm) : null;
    if (!role || !["owner", "creator"].includes(role)) throw fail("Creator role required", 403);
    return realm;
  };
  const current = async (id: string, request: any) => {
    const realm = await authorize(request), project = await dependencies.descriptors.get(id);
    if (!project || project.realmId !== realm.id) throw fail("game Descriptor project not found in Realm", 404);
    return { realm, project };
  };
  const basePack = async (request: any, expected: { id: string; version: string }): Promise<{ pack: LoadedWorldPack; document: WorldPackDocument }> => {
    const realm = await realmFor(request), pack = app.masterhostActivePack ? await app.masterhostActivePack(realm) : null;
    if (!pack || pack.manifest.id !== expected.id || pack.manifest.version !== expected.version) throw fail(`base Pack ${expected.id}@${expected.version} is not active`, 409);
    const project = (await dependencies.packs.list(realm.id)).find(value => value.status === "published" && value.document.manifest.id === expected.id && value.document.manifest.version === expected.version);
    const document = project?.document ?? await worldPackDocumentFromLoaded(pack, realm.brand);
    return { pack, document };
  };
  const selection = (value: unknown): GameFragmentSelection[] => {
    if (!Array.isArray(value)) throw fail("selections must be an array");
    return value.map((entry: any) => {
      if (entry?.parameters !== undefined && (!entry.parameters || typeof entry.parameters !== "object" || Array.isArray(entry.parameters))) throw fail(`parameters for ${String(entry?.fragmentId ?? "fragment")} must be an object`);
      const parameters = scalarRecord(entry?.parameters);
      for (const [key, item] of Object.entries(parameters)) if (!["string", "number", "boolean"].includes(typeof item)) throw fail(`parameter ${String(entry?.fragmentId ?? "fragment")}.${key} must be scalar`);
      return { fragmentId: String(entry?.fragmentId ?? ""), version: String(entry?.version ?? ""), parameters: parameters as Record<string, string | number | boolean> };
    });
  };
  const decisions = (value: unknown) => structuredClone(scalarRecord(value));
  const locks = (value: unknown) => Array.isArray(value) ? [...new Set(value.filter(item => typeof item === "string"))] as string[] : [];
  const compose = (input: { id: string; revision: number; name: string; base: WorldPackDocument; selections: GameFragmentSelection[] }) => {
    const result = composeGameDescriptor({ projectId: input.id, revision: input.revision, name: input.name, base: input.base, fragments: dependencies.fragments, selections: input.selections }), selected = new Set(input.selections.map(value => `${value.fragmentId}@${value.version}`));
    for (const selection of input.selections) {
      const asset = dependencies.assets.find(value => value.id === selection.fragmentId && value.version === selection.version); if (!asset) continue;
      if (!asset.compatibility.basePackIds.includes(input.base.manifest.id)) result.report.diagnostics.push({ code: "capability", path: asset.id, message: `asset is not compatible with base Pack ${input.base.manifest.id}` });
      for (const dependency of asset.dependencies) if (!selected.has(`${dependency.id}@${dependency.version}`)) result.report.diagnostics.push({ code: "capability", path: asset.id, message: `missing exact asset dependency ${dependency.id}@${dependency.version}` });
    }
    result.report.valid = result.report.diagnostics.length === 0; return result;
  };
  const worldDescriptor = (project: GameDescriptorProject) => {
    const choices = Object.entries(project.decisions).map(([path, value]) => ({ path, value: { mode: "explicit" as const, value } as DescriptorValue, locked: project.locks.includes(path) }));
    const descriptor = buildDescriptor({ packId: project.compiled.manifest.id, packVersion: project.compiled.manifest.version, choices, seed: project.seed });
    descriptor.composition = { projectId: project.id, revision: project.revision, selections: structuredClone(project.selections) };
    return descriptor;
  };
  const compile = (project: GameDescriptorProject, realmId: string, worldId?: string) => {
    const pack = toLoadedWorldPack(project.compiled), descriptor = worldDescriptor(project), result = compileSatisfying({ realmId, descriptor, pack, seed: project.seed, worldId });
    if (result.constraints.some(value => !value.passed)) throw fail("composed Pack constraints could not be satisfied", 409);
    assertUniqueMaterializationPaths(result.world); return result.world;
  };

  app.get("/api/game-fragments", async (request: any) => { await authorize(request); return fragmentCatalog(dependencies.fragments.filter(fragment => !assetIdentities.has(`${fragment.id}@${fragment.version}`))); });
  app.get("/api/game-assets", async (request: any) => { await authorize(request); return gameAssetCatalog(dependencies.assets, { query: request.query?.query, type: request.query?.type, tag: request.query?.tag, basePackId: request.query?.basePackId }); });
  app.post("/api/game-assets/quick-review", async (request: any) => {
    await authorize(request); const expected = request.body?.basePack, entries = request.body?.selections;
    if (!expected?.id || !expected?.version) throw fail("exact basePack is required");
    await basePack(request, { id: String(expected.id), version: String(expected.version) });
    if (!Array.isArray(entries) || entries.length > 64) throw fail("selections must be an array with at most 64 entries");
    const selections: QuickGameSelection[] = entries.map((entry: any) => { const id = String(entry?.id ?? ""), version = String(entry?.version ?? ""); if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(id) || !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(version)) throw fail("every selection requires a valid exact id and version"); return { id, version }; });
    return reviewQuickGameSelection(dependencies.assets, String(expected.id), selections);
  });
  app.get("/api/game-assets/media/:checksum/*", async (request: any, reply) => {
    await authorize(request);
    const name = String(request.params["*"] ?? ""), media = gameAssetMedia(dependencies.assets, name, String(request.params.checksum));
    if (!media) throw fail("game asset media not found", 404);
    reply.header("content-type", media.mediaType); reply.header("content-length", String(media.size)); reply.header("cache-control", "public, max-age=31536000, immutable"); reply.header("x-content-type-options", "nosniff");
    return reply.send(await readFile(media.absolutePath));
  });
  app.get("/api/game-assets/:id/:version", async (request: any) => { await authorize(request); const asset = gameAssetDetail(dependencies.assets, request.params.id, request.params.version); if (!asset) throw fail("game asset not found", 404); return asset; });
  app.get("/api/game-descriptors", async (request: any) => dependencies.descriptors.list((await authorize(request)).id));
  app.post("/api/game-descriptors/preview", async (request: any) => {
    await authorize(request); const name = String(request.body?.name ?? "").trim(), expected = request.body?.basePack;
    if (!name || name.length > 120 || !expected?.id || !expected?.version) throw fail("name and exact basePack are required");
    const base = await basePack(request, { id: String(expected.id), version: String(expected.version) });
    return compose({ id: "preview", revision: 1, name, base: base.document, selections: selection(request.body?.selections) });
  });
  app.post("/api/game-descriptors", async (request: any) => {
    const realm = await authorize(request), id = randomUUID(), name = String(request.body?.name ?? "").trim(), seed = String(request.body?.seed ?? "").trim() || randomUUID(), expected = request.body?.basePack;
    if (!name || name.length > 120 || !expected?.id || !expected?.version) throw fail("name and exact basePack are required");
    const base = await basePack(request, { id: String(expected.id), version: String(expected.version) }), selections = selection(request.body?.selections), result = compose({ id, revision: 1, name, base: base.document, selections });
    if (!result.report.valid) throw fail(result.report.diagnostics.map(value => `${value.path}: ${value.message}`).join("; "), 409);
    const now = new Date().toISOString(), project: GameDescriptorProject = { id, realmId: realm.id, name, revision: 1, seed, basePack: { id: base.pack.manifest.id, version: base.pack.manifest.version }, selections, decisions: decisions(request.body?.decisions), locks: locks(request.body?.locks), compiled: result.document, report: result.report, createdAt: now, updatedAt: now };
    return dependencies.descriptors.create(project);
  });
  app.get("/api/game-descriptors/:id", async (request: any) => (await current(request.params.id, request)).project);
  app.put("/api/game-descriptors/:id", async (request: any) => {
    const { project } = await current(request.params.id, request), expectedRevision = Number(request.body?.expectedRevision);
    if (!Number.isSafeInteger(expectedRevision)) throw fail("expectedRevision is required");
    const base = await basePack(request, project.basePack), name = String(request.body?.name ?? project.name).trim(), selections = selection(request.body?.selections), revision = expectedRevision + 1, result = compose({ id: project.id, revision, name, base: base.document, selections });
    if (!result.report.valid) throw fail(result.report.diagnostics.map(value => `${value.path}: ${value.message}`).join("; "), 409);
    return dependencies.descriptors.save({ ...project, name, revision, seed: String(request.body?.seed ?? project.seed), selections, decisions: decisions(request.body?.decisions), locks: locks(request.body?.locks), compiled: result.document, report: result.report, updatedAt: new Date().toISOString() }, expectedRevision);
  });
  app.post("/api/game-descriptors/:id/preview", async (request: any) => {
    const { project } = await current(request.params.id, request);
    if (request.body?.selections === undefined) return { document: project.compiled, report: project.report };
    const base = await basePack(request, project.basePack), name = String(request.body?.name ?? project.name).trim();
    if (!name || name.length > 120) throw fail("name is required");
    return compose({ id: project.id, revision: project.revision + 1, name, base: base.document, selections: selection(request.body.selections) });
  });
  app.post("/api/game-descriptors/:id/compile", async (request: any) => { const { realm, project } = await current(request.params.id, request); return dependencies.worlds.save(compile(project, realm.id), `game-descriptor:${project.id}@${project.revision}`); });

  const recomposition = async (request: any) => {
    const { realm, project } = await current(request.params.id, request), world = await dependencies.worlds.get(request.params.worldId);
    if (!world || world.realmId !== realm.id) throw fail("world not found in Realm", 404);
    if (world.descriptor.composition?.projectId !== project.id) throw fail("world does not originate from this game Descriptor", 409);
    const fresh = compile(project, realm.id, world.id); preserveCustomByPath(world, fresh);
    fresh.assets = structuredClone(world.assets); fresh.authoring = structuredClone(world.authoring); fresh.createdAt = world.createdAt; fresh.updatedAt = new Date().toISOString(); fresh.revision = world.revision + 1;
    return { world, fresh };
  };
  app.post("/api/game-descriptors/:id/worlds/:worldId/recompose/preview", async (request: any) => { const { world, fresh } = await recomposition(request); return { ...compareWorlds(world, fresh), packId: fresh.packId, packVersion: fresh.packVersion }; });
  app.post("/api/game-descriptors/:id/worlds/:worldId/recompose", async (request: any) => { const { world, fresh } = await recomposition(request); await dependencies.worlds.snapshot(world, `Before game Descriptor recomposition r${world.revision}`); return dependencies.worlds.save(fresh, `game-descriptor-recompose:${request.params.id}`); });
}
