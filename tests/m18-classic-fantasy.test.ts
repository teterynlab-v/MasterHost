import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { assessDeepUniverse, loadUniverseCatalog, loadWorldPack, resolveUniverseCatalog, worldPackDocumentFromLoaded } from "@masterhost/worldpack-sdk";
import { composeGameDescriptor, gameAssetFragments, loadGameAssetRegistry, quickGameAssetTypes, reviewQuickGameSelection } from "@masterhost/descriptor";

describe("M18 Deep Classic Fantasy", () => {
  it("loads the installed 2.0.0 profile into a portable document and ready catalog entry", async () => {
    const pack = await loadWorldPack(resolve("worldpacks/classic-fantasy"));
    expect(pack.manifest).toMatchObject({ id: "masterhost.classic-fantasy", version: "2.0.0" });
    expect(pack.universe).toMatchObject({ id: "classic-fantasy", playToday: { patternId: "border-kingdoms" } });
    const document = await worldPackDocumentFromLoaded(pack, { terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#d9b45b", accent: "#739b68", background: "#101713" } });
    expect(assessDeepUniverse(document)).toMatchObject({ passed: true, diagnostics: [] });
    const catalog = await loadUniverseCatalog();
    expect(resolveUniverseCatalog(catalog, [document]).find(item => item.id === "classic-fantasy")).toMatchObject({ availability: "ready", playToday: { patternId: "border-kingdoms" } });
  });

  it("ships a complete Quick selection that also composes in Advanced mode", async () => {
    const assets = await loadGameAssetRegistry(resolve("game-assets/library"));
    const selected = assets.filter(asset => asset.id.startsWith("masterhost.asset.classic.")).map(asset => ({ id: asset.id, version: asset.version }));
    const review = reviewQuickGameSelection(assets, "masterhost.classic-fantasy", selected);
    expect(review).toMatchObject({ ready: true, diagnostics: [] });
    expect(review.selected).toHaveLength(quickGameAssetTypes.length);
    expect(review.counts).toMatchObject({ locations: 24, actors: 42, items: 24, scenes: 18, archetypes: 8, media: 6 });
    const base = await worldPackDocumentFromLoaded(await loadWorldPack(resolve("worldpacks/classic-fantasy")), { terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#d9b45b", accent: "#739b68", background: "#101713" } });
    const result = composeGameDescriptor({ projectId: "m18-classic", revision: 1, name: "The First Oath", base, fragments: gameAssetFragments(assets), selections: review.orderedSelections.map(value => ({ fragmentId: value.id, version: value.version, parameters: {} })) });
    expect(result.report.valid, JSON.stringify(result.report.diagnostics)).toBe(true);
    expect(result.document.universe?.playToday).toMatchObject({ patternId: "border-kingdoms", campaignKitId: "kit.border-kingdoms" });
    expect(result.document.manifest).toMatchObject({ id: "masterhost.game.m18-classic", name: "The First Oath" });
  });
});
