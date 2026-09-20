import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { loadWorldPack } from "@masterhost/worldpack-sdk";
import { compileWorld } from "@masterhost/world-compiler";
import { exportMhWorldZip, importMhWorldZip } from "@masterhost/persistence";

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
  it("rejects a corrupted ZIP and unsupported asset import", async () => {
    const pack = await loadWorldPack(resolve("worldpacks/classic-fantasy-test"));
    const realmId = "00000000-0000-4000-a000-000000000001";
    const descriptor = { schemaVersion: "0.1", worldPack: { id: pack.manifest.id, version: pack.manifest.version }, decisions: {}, locks: [], seedPolicy: "explicit" as const, seed: "import-test" };
    const world = compileWorld({ realmId, descriptor, pack, seed: "import-test" });
    const bytes = exportMhWorldZip(world);
    expect(() => importMhWorldZip(bytes.slice(0, 12), realmId)).toThrow(/Invalid ZIP/);
    expect(() => importMhWorldZip(exportMhWorldZip(world, { "custom/readme.txt": new TextEncoder().encode("asset") }), realmId)).toThrow(/Asset import/);
  });
});
