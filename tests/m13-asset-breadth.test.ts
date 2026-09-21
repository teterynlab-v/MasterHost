import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { composeGameDescriptor, gameAssetFragments, loadGameAssetRegistry, quickGameAssetTypes, reviewQuickGameSelection } from "@masterhost/descriptor";
import { loadWorldPack, worldPackDocumentFromLoaded } from "@masterhost/worldpack-sdk";

const brand = { terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#081827", accent: "#2dd4bf", background: "#030712" } };

describe("M13 choice-rich asset library", () => {
  it("offers at least three compatible choices in every Quick category", async () => {
    const assets = await loadGameAssetRegistry(resolve("game-assets/library"));
    for (const type of quickGameAssetTypes) expect(assets.filter(asset => asset.type === type && asset.compatibility.basePackIds.includes("masterhost.space-opera")), type).toHaveLength(3);
  });

  it("composes two structurally and visually distinct valid games", async () => {
    const assets = await loadGameAssetRegistry(resolve("game-assets/library"));
    const base = await worldPackDocumentFromLoaded(await loadWorldPack(resolve("worldpacks/space-opera")), brand);
    const compose = (theme: string) => {
      const chosen = quickGameAssetTypes.map(type => assets.find(asset => asset.type === type && asset.id.includes(`.${theme}.`))!);
      const review = reviewQuickGameSelection(assets, "masterhost.space-opera", chosen.map(({ id, version }) => ({ id, version })));
      expect(review.ready, JSON.stringify(review.diagnostics)).toBe(true);
      const selections = review.orderedSelections.map(value => ({ fragmentId: value.id, version: value.version, parameters: Object.fromEntries(Object.entries(assets.find(asset => asset.id === value.id)!.fragment.parameters).flatMap(([key, definition]) => definition.default === undefined ? [] : [[key, definition.default]])) }));
      return composeGameDescriptor({ projectId: theme, revision: 1, name: theme, base, fragments: gameAssetFragments(assets), selections });
    };
    const sunforge = compose("sunforge"), nightglass = compose("nightglass");
    expect(sunforge.report.valid, JSON.stringify(sunforge.report.diagnostics)).toBe(true);
    expect(nightglass.report.valid, JSON.stringify(nightglass.report.diagnostics)).toBe(true);
    expect(sunforge.document.content.templates).not.toEqual(nightglass.document.content.templates);
    expect(sunforge.document.manifest.defaultArtSet).toBe("sunforge");
    expect(nightglass.document.manifest.defaultArtSet).toBe("nightglass");
    expect(Object.keys(sunforge.document.assets).some(name => name.startsWith("sunforge/"))).toBe(true);
    expect(Object.keys(nightglass.document.assets).some(name => name.startsWith("nightglass/"))).toBe(true);
  });
});
