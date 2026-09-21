import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { gameAssetMedia, type GameAsset } from "@masterhost/descriptor";
import { exportMhGame, inspectMhGame, type GameDescriptorProject, GameDescriptorRepository, GamePackageRepository, PackProjectRepository, WorldRepository } from "@masterhost/persistence";
import type { LoadedWorldPack, WorldPackProject } from "@masterhost/worldpack-sdk";

interface Dependencies { packages: GamePackageRepository; descriptors: GameDescriptorRepository; worlds: WorldRepository; packs: PackProjectRepository; assets: GameAsset[] }
const fail = (message: string, statusCode = 400) => Object.assign(Error(message), { statusCode });

export async function registerGamePackages(app: FastifyInstance, dependencies: Dependencies) {
  const realmFor = async (request: any) => app.masterhostResolveRealm ? app.masterhostResolveRealm(request) : fail("Realm hosting is unavailable", 503) as never;
  const authorize = async (request: any) => { const realm = await realmFor(request), role = app.masterhostRole ? await app.masterhostRole(request, realm) : null; if (!role || !["owner", "creator"].includes(role)) throw fail("Creator role required", 403); return realm; };
  const assetData = async (document: any, realmId: string, active: LoadedWorldPack | null) => {
    const projects = await dependencies.packs.list(realmId), result: Record<string, string> = {};
    for (const [name, metadata] of Object.entries(document.assets) as [string, any][]) {
      const media = gameAssetMedia(dependencies.assets, name, metadata.checksum);
      if (media) result[name] = (await readFile(media.absolutePath)).toString("base64");
      else {
        const project = projects.find(value => value.document.assets[name]?.checksum === metadata.checksum && value.assetData[name]);
        if (project) result[name] = project.assetData[name]!;
        else if (active?.root && active.assets.includes(`assets/${name}`)) { const bytes = await readFile(join(active.root, "assets", name)); result[name] = bytes.toString("base64"); }
        else throw fail(`Pack media ${name} is unavailable for export`, 409);
      }
    }
    return result;
  };
  const source = async (world: any, realm: any) => {
    const projects = await dependencies.packs.list(realm.id), published = projects.find(value => value.status === "published" && value.document.manifest.id === world.packId && value.document.manifest.version === world.packVersion);
    const composition = world.descriptor.composition, descriptor = composition ? await dependencies.descriptors.revision(composition.projectId, composition.revision) : null;
    if (published) return { pack: published, descriptor };
    if (!descriptor) throw fail("World has no exportable Pack source", 409);
    const active = app.masterhostActivePack ? await app.masterhostActivePack(realm) : null, now = new Date().toISOString();
    const pack: WorldPackProject = { id: randomUUID(), realmId: realm.id, status: "published", revision: 1, document: descriptor.compiled, assetData: await assetData(descriptor.compiled, realm.id, active), createdAt: now, updatedAt: now, publishedAt: now, lineage: { source: "game-descriptor", projectId: descriptor.id, revision: descriptor.revision } };
    return { pack, descriptor };
  };
  const descriptorEvidence = (value: GameDescriptorProject | null) => value ? { id: value.id, name: value.name, revision: value.revision, seed: value.seed, basePack: value.basePack, selections: value.selections, decisions: value.decisions, locks: value.locks } : undefined;

  app.get("/api/worlds/:id/export-game", async (request: any, reply) => {
    const realm = await authorize(request), world = await dependencies.worlds.get(request.params.id);
    if (!world || world.realmId !== realm.id) throw fail("world not found in Realm", 404);
    const previous = await dependencies.packages.getByWorld(realm.id, world.id), resolved = await source(world, realm), evidence = previous?.evidence;
    const selected = (resolved.descriptor?.selections ?? evidence?.descriptorProject?.selections ?? []).map((selection: any) => dependencies.assets.find(asset => asset.id === selection.fragmentId && asset.version === selection.version) ?? evidence?.gameAssets?.find((asset: any) => asset.id === selection.fragmentId && asset.version === selection.version)).filter(Boolean);
    const gameAssets = selected.map((asset: any) => structuredClone(asset)), media = Object.fromEntries(Object.entries(resolved.pack.document.assets).map(([name, value]) => [name, value.checksum]));
    const attribution = [{ kind: "pack" as const, id: resolved.pack.document.manifest.id, version: resolved.pack.document.manifest.version, spdx: "LicenseRef-Pack", attribution: resolved.pack.document.manifest.publisher ?? resolved.pack.document.manifest.name, source: `masterhost://pack/${resolved.pack.document.manifest.id}` }, ...gameAssets.map((asset: any) => ({ kind: "asset" as const, id: asset.id, version: asset.version, ...asset.license }))];
    const bytes = exportMhGame({ packageId: randomUUID(), name: world.name, packProject: resolved.pack, world, worldAssets: await dependencies.worlds.assets(world.id), descriptorProject: descriptorEvidence(resolved.descriptor) ?? evidence?.descriptorProject, gameAssets, dependencyLock: { pack: { id: world.packId, version: world.packVersion }, assets: gameAssets.map((asset: any) => ({ id: asset.id, version: asset.version, contentChecksum: asset.contentChecksum })), media }, attribution });
    reply.header("content-type", "application/vnd.masterhost.game+zip"); reply.header("content-disposition", `attachment; filename="${world.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.mhgame"`); return reply.send(Buffer.from(bytes));
  });
  app.post("/api/games/import", async (request: any) => {
    const realm = await authorize(request); if (!Buffer.isBuffer(request.body)) throw fail("mhgame ZIP body required", 415);
    let game; try { game = inspectMhGame(request.body, realm.id); } catch (error) { throw fail(error instanceof Error ? error.message : "Invalid mhgame archive"); }
    return dependencies.packages.install(game, realm.id);
  });
  app.get("/api/games/imports/:worldId", async (request: any) => dependencies.packages.getByWorld((await authorize(request)).id, request.params.worldId));
}
