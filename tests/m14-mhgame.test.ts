import { createHash, randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { createStarterPack } from "@masterhost/worldpack-sdk";
import { buildDescriptor } from "@masterhost/descriptor";
import { compileWorld } from "@masterhost/world-compiler";
import { exportMhGame, inspectMhGame, type MhGameExportInput } from "@masterhost/persistence";

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
    expect(() => inspectMhGame(new Uint8Array(25_000_001), randomUUID())).toThrow(/25 MB/i);
    const mismatch = fixture(); mismatch.world.packVersion = "9.9.9"; mismatch.world.descriptor.worldPack.version = "9.9.9";
    expect(() => exportMhGame(mismatch)).toThrow(/Pack identity/i);
  });
});
