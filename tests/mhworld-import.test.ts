import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadWorldPack } from "@masterhost/worldpack-sdk";
import { compileWorld, assignEntityImage, preserveCustomByPath } from "@masterhost/world-compiler";
import { exportMhWorldZip, importMhWorldZip, importMhWorldZipWithAssets, assetChecksum } from "@masterhost/persistence";

describe("mhworld ZIP import", () => {
  it("preserves materialized values while assigning independent world and entity IDs", async () => {
    const pack = await loadWorldPack(resolve("worldpacks/classic-fantasy-test"));
    const realmId = "00000000-0000-4000-a000-000000000001";
    const descriptor = { schemaVersion: "0.1", worldPack: { id: pack.manifest.id, version: pack.manifest.version }, decisions: {}, locks: [], seedPolicy: "explicit" as const, seed: "import-test" };
    const original = compileWorld({ realmId, descriptor, pack, seed: "import-test" });
    const imported = importMhWorldZip(exportMhWorldZip(original), realmId);
    expect(imported.id).not.toBe(original.id);
    expect(imported.packId).toBe(original.packId);
    expect(imported.entities.map(e => [e.materializationPath, e.values])).toEqual(original.entities.map(e => [e.materializationPath, e.values]));
    expect(imported.entities.every(e => e.worldId === imported.id && e.id !== original.entities.find(o => o.materializationPath === e.materializationPath)?.id)).toBe(true);
    expect(imported.entities.every(e => !e.parentId || imported.entities.some(parent => parent.id === e.parentId))).toBe(true);
  });
  it("rejects a corrupted ZIP and inconsistent asset manifests", async () => {
    const pack = await loadWorldPack(resolve("worldpacks/classic-fantasy-test"));
    const realmId = "00000000-0000-4000-a000-000000000001";
    const descriptor = { schemaVersion: "0.1", worldPack: { id: pack.manifest.id, version: pack.manifest.version }, decisions: {}, locks: [], seedPolicy: "explicit" as const, seed: "import-test" };
    const world = compileWorld({ realmId, descriptor, pack, seed: "import-test" });
    const bytes = exportMhWorldZip(world);
    expect(() => importMhWorldZip(bytes.slice(0, 12), realmId)).toThrow(/Invalid ZIP/);
    expect(() => exportMhWorldZip(world, { "portrait.png": new Uint8Array([1]) })).toThrow(/asset set is incomplete/);
  });
  it("preserves verified image assets in an imported independent World", async () => {
    const pack = await loadWorldPack(resolve("worldpacks/classic-fantasy-test")), realmId = "00000000-0000-4000-a000-000000000001";
    const descriptor = { schemaVersion: "0.1", worldPack: { id: pack.manifest.id, version: pack.manifest.version }, decisions: {}, locks: [], seedPolicy: "explicit" as const, seed: "asset-test" };
    const world = compileWorld({ realmId, descriptor, pack, seed: "asset-test" });
    const image = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==", "base64"));
    world.assets = { "portrait.png": { checksum: assetChecksum(image), mediaType: "image/png", size: image.length } };
    const assigned=assignEntityImage(world,world.entities[0]!.id,"portrait","portrait.png");
    expect(assigned.entities[0]?.assets?.roles?.portrait?.checksum).toBe(assetChecksum(image));
    const fresh=compileWorld({realmId,descriptor,pack,seed:"new-seed",worldId:world.id});preserveCustomByPath(assigned,fresh);
    expect(fresh.entities[0]?.assets).toEqual(assigned.entities[0]?.assets);
    expect(assignEntityImage(assigned,assigned.entities[0]!.id,"portrait",null).entities[0]?.assets).toBeUndefined();
    const archive = exportMhWorldZip(assigned, { "portrait.png": image });
    const result = importMhWorldZipWithAssets(archive, realmId);
    expect(result.world.id).not.toBe(world.id);
    expect(result.world.assets).toEqual(world.assets);
    expect(result.world.entities[0]?.assets).toEqual(assigned.entities[0]?.assets);
    expect(result.assets["portrait.png"]).toEqual(image);
    expect(() => importMhWorldZip(archive, realmId)).toThrow(/persistent storage/);
    const altered = image.slice();altered[12] ^= 1;
    expect(() => exportMhWorldZip(assigned, { "portrait.png": altered })).toThrow(/Invalid World asset/);
    expect(() => exportMhWorldZip({ ...assigned, assets: {} }, {})).toThrow(/invalid entity image assignment/);
  });
});
