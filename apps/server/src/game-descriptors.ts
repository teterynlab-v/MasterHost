import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { buildDescriptor, composeGameDescriptor, fragmentCatalog, type GameDescriptorFragment, type GameFragmentSelection } from "@masterhost/descriptor";
import type { DescriptorValue, MaterializedWorld } from "@masterhost/domain";
import { GameDescriptorRepository, PackProjectRepository, WorldRepository, type GameDescriptorProject } from "@masterhost/persistence";
import { toLoadedWorldPack, type LoadedWorldPack, type WorldPackDocument } from "@masterhost/worldpack-sdk";
import { assertUniqueMaterializationPaths, compareWorlds, compileSatisfying, preserveCustomByPath } from "@masterhost/world-compiler";

interface Dependencies { descriptors: GameDescriptorRepository; worlds: WorldRepository; packs: PackProjectRepository; fragments: GameDescriptorFragment[] }

const fail = (message: string, statusCode = 400) => Object.assign(Error(message), { statusCode });
const scalarRecord = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

export async function registerGameDescriptors(app: FastifyInstance, dependencies: Dependencies) {
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
    const document: WorldPackDocument = project?.document ?? { manifest: structuredClone(pack.manifest), content: structuredClone(pack.content), artSets: structuredClone(pack.artSets), dependencies: [], migrations: [], fixtures: [{ id: "composed", seed: "composed", choices: {}, expect: {} }], terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#6dd6a8", accent: "#7aa7dd", background: "#0f131a" }, assets: {} };
    return { pack, document };
  };
  const selection = (value: unknown): GameFragmentSelection[] => {
    if (!Array.isArray(value)) throw fail("selections must be an array");
    return value.map((entry: any) => ({ fragmentId: String(entry?.fragmentId ?? ""), version: String(entry?.version ?? ""), parameters: Object.fromEntries(Object.entries(scalarRecord(entry?.parameters)).filter(([, item]) => ["string", "number", "boolean"].includes(typeof item))) as Record<string, string | number | boolean> }));
  };
  const decisions = (value: unknown) => structuredClone(scalarRecord(value));
  const locks = (value: unknown) => Array.isArray(value) ? [...new Set(value.filter(item => typeof item === "string"))] as string[] : [];
  const compose = (input: { id: string; revision: number; name: string; base: WorldPackDocument; selections: GameFragmentSelection[] }) => composeGameDescriptor({ projectId: input.id, revision: input.revision, name: input.name, base: input.base, fragments: dependencies.fragments, selections: input.selections });
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

  app.get("/api/game-fragments", async (request: any) => { await authorize(request); return fragmentCatalog(dependencies.fragments); });
  app.get("/api/game-descriptors", async (request: any) => dependencies.descriptors.list((await authorize(request)).id));
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
  app.post("/api/game-descriptors/:id/preview", async (request: any) => { const { project } = await current(request.params.id, request); return { document: project.compiled, report: project.report }; });
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
