import { afterEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { gameAssetCatalog, gameAssetFragments, gameAssetMedia, loadGameAssetRegistry } from "@masterhost/descriptor";
import { composeGameDescriptor } from "@masterhost/descriptor";
import { loadWorldPack, toLoadedWorldPack, worldPackDocumentFromLoaded } from "@masterhost/worldpack-sdk";
import { compileSatisfying } from "@masterhost/world-compiler";

const roots: string[] = []; afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });
const sha = (value: Buffer) => createHash("sha256").update(value).digest("hex");
const manifest = (overrides: any = {}) => ({ schemaVersion: "1", id: "masterhost.asset.test", version: "1.0.0", type: "setting", name: "Test Asset", description: "Reusable test content", tags: ["test"], preview: { summary: "Test preview", highlights: ["One block"] }, compatibility: { basePackIds: ["masterhost.space-opera"], requiresCapabilities: [], providesCapabilities: ["setting:test"], conflicts: [] }, dependencies: [], license: { spdx: "CC-BY-4.0", attribution: "MasterHost test contributors", source: "masterhost://bundled/test" }, published: true, counts: { locations: 0, actors: 0, items: 0, scenes: 0, archetypes: 0, rules: 0, media: 0 }, media: [], fragment: { id: "masterhost.asset.test", version: "1.0.0", name: "Test Asset", provides: ["setting:test"], requires: [], conflicts: [], parameters: {}, patches: [] }, ...overrides });
async function fixture(value = manifest(), media?: Buffer) { const root = await mkdtemp(join(tmpdir(), "m11-assets-")); roots.push(root); if (media) await writeFile(join(root, "preview.svg"), media); await writeFile(join(root, "asset.json"), JSON.stringify(value)); return root; }

describe("M11 game asset registry", () => {
  it("loads immutable licensed assets, filters their catalog and resolves verified media", async () => { const bytes = Buffer.from("<svg/>"); const value = manifest({ counts: { locations: 0, actors: 0, items: 0, scenes: 0, archetypes: 0, rules: 0, media: 1 }, media: [{ name: "test.svg", path: "preview.svg", role: "map", mediaType: "image/svg+xml", checksum: sha(bytes), size: bytes.length }] }); const assets = await loadGameAssetRegistry(await fixture(value, bytes)); expect(gameAssetCatalog(assets, { query: "reusable", type: "setting", tag: "test", basePackId: "masterhost.space-opera" })).toHaveLength(1); expect(gameAssetFragments(assets)[0]!.patches).toContainEqual(expect.objectContaining({ path: "/assets/test.svg" })); expect(gameAssetMedia(assets, "test.svg", sha(bytes))?.absolutePath).toContain("preview.svg"); });
  it.each([
    [manifest({ license: { spdx: "ARR", attribution: "Owner", source: "local" } }), "Invalid option"],
    [manifest({ fragment: { ...manifest().fragment, id: "different" } }), "fragment identity"],
    [manifest({ media: [{ name: "bad.svg", path: "../bad.svg", role: "map", mediaType: "image/svg+xml", checksum: "0".repeat(64), size: 1 }], counts: { locations: 0, actors: 0, items: 0, scenes: 0, archetypes: 0, rules: 0, media: 1 } }), "unsafe asset media path"],
    [manifest({ dependencies: [{ id: "missing", version: "1.0.0" }] }), "missing dependency"],
    [manifest({ compatibility: { basePackIds: ["masterhost.space-opera"], requiresCapabilities: [], providesCapabilities: ["other"], conflicts: [] } }), "compatibility metadata"],
  ])("rejects invalid asset metadata", async (value, message) => { await expect(loadGameAssetRegistry(await fixture(value))).rejects.toThrow(message); });

  it("rejects media bytes that do not match the declared type", async () => {
    const bytes = Buffer.from("<svg/>");
    const value = manifest({ counts: { locations: 0, actors: 0, items: 0, scenes: 0, archetypes: 0, rules: 0, media: 1 }, media: [{ name: "test.png", path: "preview.svg", role: "map", mediaType: "image/png", checksum: sha(bytes), size: bytes.length }] });
    await expect(loadGameAssetRegistry(await fixture(value, bytes))).rejects.toThrow("media type mismatch");
  });

  it("composes the complete bundled Voidwake one-shot deterministically", async () => {
    const assets = await loadGameAssetRegistry(resolve("game-assets/library")), base = await worldPackDocumentFromLoaded(await loadWorldPack(resolve("worldpacks/space-opera")), { terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#081827", accent: "#2dd4bf", background: "#030712" } });
    const order = ["setting", "world-template", "locations", "cast", "items", "rules", "characters", "adventure", "visuals"], selected = order.map(type => assets.find(asset => asset.type === type)!).map(asset => ({ fragmentId: asset.id, version: asset.version, parameters: {} }));
    const input = { projectId: "voidwake-test", revision: 1, name: "Voidwake Test", base, fragments: gameAssetFragments(assets), selections: selected }, first = composeGameDescriptor(input), second = composeGameDescriptor(input);
    if (!first.report.valid) throw new Error(JSON.stringify(first.report.diagnostics, null, 2)); expect(first.document).toEqual(second.document); expect(first.document.manifest.defaultArtSet).toBe("voidwake"); expect(Object.keys(first.document.assets).filter(name => name.startsWith("voidwake/"))).toHaveLength(8);
    expect(Object.keys(first.document.content.templates).filter(id => id.startsWith("voidwake.location."))).toHaveLength(10); expect(Object.keys(first.document.content.templates).filter(id => id.startsWith("voidwake.actor."))).toHaveLength(20); expect(Object.keys(first.document.content.items ?? {}).filter(id => id.startsWith("voidwake-item-"))).toHaveLength(20); expect(Object.keys(first.document.content.templates).filter(id => id.startsWith("voidwake.scene."))).toHaveLength(12);
    const world = compileSatisfying({ realmId: "00000000-0000-4000-a000-000000000010", descriptor: { schemaVersion: "0.1", worldPack: { id: first.document.manifest.id, version: first.document.manifest.version }, decisions: {}, locks: [], seedPolicy: "explicit", seed: "voidwake" }, pack: toLoadedWorldPack(first.document), seed: "voidwake" }).world;
    expect(world.entities.filter(entity => entity.templateRef?.startsWith("voidwake.location."))).toHaveLength(10); expect(world.entities.filter(entity => entity.templateRef?.startsWith("voidwake.actor."))).toHaveLength(20); expect(world.entities.filter(entity => entity.templateRef?.startsWith("voidwake.scene."))).toHaveLength(12);
    expect(assets.every(asset => asset.license.spdx === "CC-BY-4.0" && /^[a-f0-9]{64}$/.test(asset.contentChecksum))).toBe(true);
  });
});
