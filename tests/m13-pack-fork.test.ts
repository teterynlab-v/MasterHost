import { describe, expect, it } from "vitest";
import { createPackFork, createStarterPack } from "@masterhost/worldpack-sdk";

describe("M13 Descriptor Pack fork", () => {
  it("creates an editable independent draft with exact lineage and media", () => {
    const source = createStarterPack({ realmId: "00000000-0000-4000-a000-000000000013", id: "masterhost.game.source", name: "Source" });
    source.document.assets["map.svg"] = { mediaType: "image/svg+xml", checksum: "a".repeat(64), size: 6 };
    const original = structuredClone(source.document), assetData = { "map.svg": Buffer.from("<svg/>").toString("base64") };
    const fork = createPackFork({ realmId: source.realmId, sourceProjectId: "00000000-0000-4000-a000-000000000099", sourceRevision: 4, document: source.document, assetData, id: "masterhost.custom.starfall", name: "Starfall Custom", version: "0.1.0" });
    expect(fork).toMatchObject({ status: "draft", revision: 1, lineage: { source: "game-descriptor", projectId: "00000000-0000-4000-a000-000000000099", revision: 4 } });
    expect(fork.document.manifest).toMatchObject({ id: "masterhost.custom.starfall", name: "Starfall Custom", version: "0.1.0", official: false, publisher: "MasterHost Full Custom Builder" });
    expect(fork.assetData).toEqual(assetData);
    fork.document.content.templates["world.root"]!.kind = "changed";
    expect(source.document).toEqual(original);
  });
});
