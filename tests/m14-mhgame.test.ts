import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { createStarterPack } from "@masterhost/worldpack-sdk";
import { buildDescriptor } from "@masterhost/descriptor";
import { compileWorld } from "@masterhost/world-compiler";
import { exportMhGame, inspectMhGame, GamePackageRepository, HostedPlatformRepository, PackProjectRepository, WorldRepository, type MhGameExportInput } from "@masterhost/persistence";

const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
function fixture(): MhGameExportInput {
  const realmId = randomUUID(), packProject = createStarterPack({ realmId, id: "masterhost.m14", name: "M14 Game", version: "1.2.3", worldName: "Portable Reach" });
  const svg = strToU8('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><path fill="#fff" d="M0 0h2v2H0z"/></svg>');
  packProject.document.assets["portable.svg"] = { mediaType: "image/svg+xml", checksum: sha(svg), size: svg.length }; packProject.assetData["portable.svg"] = Buffer.from(svg).toString("base64"); packProject.document.artSets.studio.defaults = { background: "portable.svg" }; packProject.status = "published";
  const descriptor = buildDescriptor({ packId: packProject.document.manifest.id, packVersion: packProject.document.manifest.version, choices: [], seed: "m14" }), world = compileWorld({ realmId, descriptor, pack: { manifest: packProject.document.manifest, content: packProject.document.content, root: "", assets: ["assets/portable.svg"], artSets: packProject.document.artSets }, seed: "m14" });
  return { packageId: randomUUID(), name: "Portable Reach", exportedAt: "2026-09-21T00:00:00.000Z", packProject, world, worldAssets: {}, descriptorProject: { id: randomUUID(), name: "Portable source", revision: 2, seed: "m14", basePack: { id: "masterhost.space-opera", version: "1.0.0" }, selections: [{ fragmentId: "masterhost.asset.sunforge.setting", version: "1.0.0", parameters: {} }], decisions: { "world.tone": "heroic" }, locks: [] }, gameAssets: [{ schemaVersion: "1", id: "masterhost.asset.sunforge.setting", version: "1.0.0", type: "setting", name: "Sunforge", contentChecksum: "a".repeat(64), license: { spdx: "CC-BY-4.0", attribution: "MasterHost contributors", source: "masterhost://bundled/sunforge" } }], dependencyLock: { pack: { id: "masterhost.m14", version: "1.2.3" }, assets: [{ id: "masterhost.asset.sunforge.setting", version: "1.0.0", contentChecksum: "a".repeat(64) }], media: { "portable.svg": sha(svg) } }, attribution: [{ kind: "pack", id: "masterhost.m14", version: "1.2.3", spdx: "CC-BY-4.0", attribution: "M14 test", source: "https://example.test/m14" }, { kind: "asset", id: "masterhost.asset.sunforge.setting", version: "1.0.0", spdx: "CC-BY-4.0", attribution: "MasterHost contributors", source: "masterhost://bundled/sunforge" }] };
}

describe("M14 mhgame transport", () => {
  it("round-trips the exact nested packages, evidence and media", () => {
    const input = fixture(), bytes = exportMhGame(input), files = unzipSync(bytes);
    expect(exportMhGame(input)).toEqual(bytes);
    expect(Object.keys(files).sort()).toEqual(["attribution.json", "checksums.json", "dependencies.lock.json", "game-assets/masterhost.asset.sunforge.setting@1.0.0.json", "game.json", "pack.mhpack", "world.mhworld"]);
    const imported = inspectMhGame(bytes, randomUUID());
    expect(imported.manifest.packageId).toBe(input.packageId); expect(imported.runtimePack.document).toEqual(input.packProject.document); expect(imported.runtimePack.assetData).toEqual(input.packProject.assetData);
    expect(imported.world.entities.map(value => [value.materializationPath, value.values])).toEqual(input.world.entities.map(value => [value.materializationPath, value.values]));
    expect(imported.descriptorProject?.selections).toEqual(input.descriptorProject?.selections); expect(imported.dependencyLock).toEqual(input.dependencyLock); expect(imported.attribution).toEqual(input.attribution);
  });

  it("migrates the legacy license entry and rejects unsupported versions", () => {
    const files = unzipSync(exportMhGame(fixture())), manifest = JSON.parse(strFromU8(files["game.json"]!)); manifest.formatVersion = "0.0"; files["game.json"] = strToU8(JSON.stringify(manifest)); files["licenses.json"] = files["attribution.json"]!; delete files["attribution.json"];
    const checksums = Object.fromEntries(Object.entries(files).filter(([name]) => name !== "checksums.json").map(([name, data]) => [name, sha(data)])); files["checksums.json"] = strToU8(JSON.stringify(checksums));
    expect(inspectMhGame(zipSync(files), randomUUID()).manifest.formatVersion).toBe("0.1");
    manifest.formatVersion = "9.0"; files["game.json"] = strToU8(JSON.stringify(manifest)); files["checksums.json"] = strToU8(JSON.stringify({ ...checksums, "game.json": sha(files["game.json"]!) }));
    expect(() => inspectMhGame(zipSync(files), randomUUID())).toThrow(/unsupported mhgame format/i);
  });

  it("rejects tampering, traversal, oversize input and cross-document Pack mismatch", () => {
    const bytes = exportMhGame(fixture()), files = unzipSync(bytes); files["game.json"]![0] ^= 1;
    expect(() => inspectMhGame(zipSync(files), randomUUID())).toThrow(/checksum/i);
    expect(() => inspectMhGame(zipSync({ "../escape": strToU8("x") }), randomUUID())).toThrow(/unsafe/i);
    expect(() => inspectMhGame(zipSync({ "%2e%2e/escape": strToU8("x") }), randomUUID())).toThrow(/unsafe/i);
    expect(() => inspectMhGame(new Uint8Array(25_000_001), randomUUID())).toThrow(/25 MB/i);
    const mismatch = fixture(); mismatch.world.packVersion = "9.9.9"; mismatch.world.descriptor.worldPack.version = "9.9.9";
    expect(() => exportMhGame(mismatch)).toThrow(/Pack identity/i);
  });
});

const databaseUrl = process.env.TEST_DATABASE_URL, databaseSuite = databaseUrl ? describe : describe.skip;
databaseSuite("M14 atomic game installation", () => {
  const realmId = "00000000-0000-4000-a000-000000000014";
  let games: GamePackageRepository, hosted: HostedPlatformRepository, packs: PackProjectRepository, worlds: WorldRepository;
  beforeAll(async () => { games = new GamePackageRepository(databaseUrl!); hosted = new HostedPlatformRepository(databaseUrl!); packs = new PackProjectRepository(databaseUrl!); worlds = new WorldRepository(databaseUrl!); await worlds.migrate(); await packs.migrate(); await hosted.migrate(); await games.migrate(); await hosted.ensureDefault(realmId); });
  afterAll(async () => { await Promise.all([games.close(), hosted.close(), packs.close(), worlds.close()]); });
  it("installs an independent World, immutable runtime Pack and editable fork in one transaction", async () => {
    const input = fixture(), imported = inspectMhGame(exportMhGame(input), realmId), installed = await games.install(imported, realmId);
    expect((await worlds.get(installed.worldId))?.realmId).toBe(realmId);
    const installedPacks = await packs.list(realmId), runtime = installedPacks.find(value => value.id === installed.runtimePackProjectId), editable = installedPacks.find(value => value.id === installed.editablePackProjectId);
    expect(runtime?.status).toBe("published"); expect(runtime?.document.manifest).toEqual(input.packProject.document.manifest);
    expect(editable?.status).toBe("draft"); expect(editable?.lineage).toMatchObject({ source: "mhgame", packageId: input.packageId });
    expect((await hosted.realm(realmId))?.activePack).toEqual(installed.runtimePack);
    await expect(games.install(imported, realmId)).rejects.toMatchObject({ statusCode: 409 });
    expect((await packs.list(realmId))).toHaveLength(2); expect(await worlds.list(realmId)).toHaveLength(1);
    const late = inspectMhGame(exportMhGame(fixture()), realmId); late.runtimePack.document.manifest.id = "masterhost.m14-late"; late.world.packId = late.world.descriptor.worldPack.id = late.dependencyLock.pack.id = "masterhost.m14-late"; late.world.assets = { "late.png": { checksum: "0".repeat(64), mediaType: "image/png", size: 10 } }; late.worldAssets = { "late.png": strToU8("bad") };
    await expect(games.install(late, realmId)).rejects.toThrow(/Missing or invalid asset/);
    expect((await packs.list(realmId))).toHaveLength(2); expect(await worlds.list(realmId)).toHaveLength(1);
  });
});
