import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { composeGameDescriptor, gameAssetFragments, loadGameAssetRegistry, quickGameAssetTypes, reviewQuickGameSelection } from "@masterhost/descriptor";
import { loadWorldPack, worldPackDocumentFromLoaded } from "@masterhost/worldpack-sdk";

const identities = (assets: Awaited<ReturnType<typeof loadGameAssetRegistry>>) => assets.filter(asset => asset.id.includes(".voidwake.")).map(asset => ({ id: asset.id, version: asset.version }));

describe("M12 quick game selection", () => {
  it("reviews a complete selection and orders exact dependencies deterministically", async () => {
    const assets = await loadGameAssetRegistry(resolve("game-assets/library"));
    const first = reviewQuickGameSelection(assets, "masterhost.space-opera", identities(assets).reverse());
    const second = reviewQuickGameSelection(assets, "masterhost.space-opera", identities(assets));
    expect(first.ready).toBe(true);
    expect(first.orderedSelections).toEqual(second.orderedSelections);
    expect(first.orderedSelections[0]).toEqual({ id: "masterhost.asset.voidwake.setting", version: "1.0.0" });
    expect(first.counts).toEqual({ locations: 10, actors: 20, items: 20, scenes: 12, archetypes: 6, rules: 15, media: 8 });
    expect(first.licenses).toHaveLength(9);
    expect(first.licenses.every(value => value.spdx === "CC-BY-4.0" && value.attribution.includes("MasterHost contributors") && value.source.startsWith("masterhost://bundled/"))).toBe(true);
    expect(first.selected).toHaveLength(quickGameAssetTypes.length);
  });

  it("reports every missing required category", async () => {
    const assets = await loadGameAssetRegistry(resolve("game-assets/library"));
    const review = reviewQuickGameSelection(assets, "masterhost.space-opera", identities(assets).filter(value => !value.id.endsWith(".visuals")));
    expect(review.ready).toBe(false);
    expect(review.diagnostics).toContainEqual(expect.objectContaining({ code: "missing-category", type: "visuals" }));
  });

  it("rejects incompatible, unknown, duplicate and dependency-incomplete input", async () => {
    const assets = await loadGameAssetRegistry(resolve("game-assets/library")), complete = identities(assets);
    expect(reviewQuickGameSelection(assets, "masterhost.classic-fantasy", complete).diagnostics).toContainEqual(expect.objectContaining({ code: "incompatible-pack" }));
    expect(reviewQuickGameSelection(assets, "masterhost.space-opera", [...complete, { id: complete[0]!.id, version: "9.9.9" }]).diagnostics).toContainEqual(expect.objectContaining({ code: "unknown-asset" }));
    expect(reviewQuickGameSelection(assets, "masterhost.space-opera", [...complete, complete[0]!]).diagnostics).toContainEqual(expect.objectContaining({ code: "duplicate-category" }));
    const withoutSetting = complete.filter(value => !value.id.endsWith(".setting"));
    expect(reviewQuickGameSelection(assets, "masterhost.space-opera", withoutSetting).diagnostics).toContainEqual(expect.objectContaining({ code: "missing-capability", capability: "setting:space-opera" }));
  });

  it("publishes an exposed world parameter that changes composed content", async () => {
    const assets = await loadGameAssetRegistry(resolve("game-assets/library"));
    const world = assets.find(asset => asset.id === "masterhost.asset.voidwake.world")!;
    expect(world.fragment.parameters.missionPremise).toEqual({
      type: "string",
      required: true,
      default: "Recover the Tide Engine before the storm closes.",
      options: ["Recover the Tide Engine before the storm closes.", "Escort the last archive ship through the closing storm."],
    });
    const base = await worldPackDocumentFromLoaded(await loadWorldPack(resolve("worldpacks/space-opera")), { terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#081827", accent: "#2dd4bf", background: "#030712" } });
    const selections = assets.filter(asset => asset.id.includes(".voidwake.")).map(asset => ({ fragmentId: asset.id, version: asset.version, parameters: asset.id === world.id ? { missionPremise: "Escort the last archive ship through the closing storm." } : {} as Record<string, string | number | boolean> }));
    const result = composeGameDescriptor({ projectId: "quick-parameters", revision: 1, name: "Quick Parameters", base, fragments: gameAssetFragments(assets), selections });
    expect(result.report.valid).toBe(true);
    expect((result.document.content.templates["voidwake.archipelago"] as any).values.premise.value).toBe("Escort the last archive ship through the closing storm.");
  });
});
