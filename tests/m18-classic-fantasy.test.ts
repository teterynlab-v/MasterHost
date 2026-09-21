import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { assessDeepUniverse, loadUniverseCatalog, loadWorldPack, resolveUniverseCatalog, toLoadedWorldPack, worldPackDocumentFromLoaded } from "@masterhost/worldpack-sdk";
import { buildDescriptor, composeGameDescriptor, gameAssetFragments, loadGameAssetRegistry, quickGameAssetTypes, reviewQuickGameSelection } from "@masterhost/descriptor";
import { compileSatisfying } from "@masterhost/world-compiler";

describe("M18 Deep Classic Fantasy", () => {
  it("loads the installed 2.0.0 profile into a portable document and ready catalog entry", async () => {
    const pack = await loadWorldPack(resolve("worldpacks/classic-fantasy"));
    expect(pack.manifest).toMatchObject({ id: "masterhost.classic-fantasy", version: "2.0.0" });
    expect(pack.universe).toMatchObject({ id: "classic-fantasy", playToday: { patternId: "border-kingdoms" } });
    expect(pack.universe!.localization.supportedLocales).toEqual(["en", "ru", "es", "ja", "zh-CN", "ko"]);
    const localeKeys = Object.keys(pack.universe!.localization.strings.en).sort();
    expect(localeKeys).toHaveLength(151);
    for (const locale of pack.universe!.localization.supportedLocales) expect(Object.keys(pack.universe!.localization.strings[locale]!).sort()).toEqual(localeKeys);
    const document = await worldPackDocumentFromLoaded(pack, { terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#d9b45b", accent: "#739b68", background: "#101713" } });
    expect(assessDeepUniverse(document)).toMatchObject({ passed: true, diagnostics: [] });
    const catalog = await loadUniverseCatalog();
    expect(resolveUniverseCatalog(catalog, [document]).find(item => item.id === "classic-fantasy")).toMatchObject({ availability: "ready", playToday: { patternId: "border-kingdoms" } });
  });

  it("retains the exact official 1.0.0 release alongside the deep 2.0.0 release", async () => {
    const [legacy, deep] = await Promise.all([loadWorldPack(resolve("worldpacks/classic-fantasy-v1")), loadWorldPack(resolve("worldpacks/classic-fantasy"))]);
    expect(legacy.manifest).toMatchObject({ id: "masterhost.classic-fantasy", version: "1.0.0" });
    expect(deep.manifest).toMatchObject({ id: "masterhost.classic-fantasy", version: "2.0.0" });
    expect(legacy.universe).toBeUndefined();
    expect(deep.universe?.patterns).toHaveLength(3);
  });

  it("ships a complete Quick selection that also composes in Advanced mode", async () => {
    const assets = await loadGameAssetRegistry(resolve("game-assets/library"));
    const selected = assets.filter(asset => asset.id.startsWith("masterhost.asset.classic.")).map(asset => ({ id: asset.id, version: asset.version }));
    const review = reviewQuickGameSelection(assets, "masterhost.classic-fantasy", selected);
    expect(review).toMatchObject({ ready: true, diagnostics: [] });
    expect(review.selected).toHaveLength(quickGameAssetTypes.length);
    expect(review.counts).toMatchObject({ locations: 12, actors: 42, items: 24, scenes: 18, archetypes: 8, rules: 6, media: 6 });
    const base = await worldPackDocumentFromLoaded(await loadWorldPack(resolve("worldpacks/classic-fantasy")), { terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#d9b45b", accent: "#739b68", background: "#101713" } });
    const result = composeGameDescriptor({ projectId: "m18-classic", revision: 1, name: "The First Oath", base, fragments: gameAssetFragments(assets), selections: review.orderedSelections.map(value => ({ fragmentId: value.id, version: value.version, parameters: {} })) });
    expect(result.report.valid, JSON.stringify(result.report.diagnostics)).toBe(true);
    expect(result.document.universe?.playToday).toMatchObject({ patternId: "border-kingdoms", campaignKitId: "kit.border-kingdoms" });
    expect(result.document.manifest).toMatchObject({ id: "masterhost.game.m18-classic", name: "The First Oath" });

    const profiles = [
      ["border-kingdoms", "kit.border-kingdoms", "visualThemes.1", "A Bell at Dawn"],
      ["war-of-heirs", "kit.war-of-heirs", "visualThemes.2", "The Closed Gate"],
      ["ancient-empire-ruins", "kit.ancient-empire-ruins", "visualThemes.3", "Tracks Beyond the Ford"],
    ] as const;
    const worlds = profiles.map(([pattern, campaignKit, visualTheme]) => {
      const decisions = { "world.pattern": pattern, "world.campaignKit": campaignKit, "world.visualTheme": visualTheme };
      const descriptor = buildDescriptor({ packId: result.document.manifest.id, packVersion: result.document.manifest.version, choices: Object.entries(decisions).map(([path, value]) => ({ path, value: { mode: "explicit" as const, value } })), seed: `m18-${pattern}` });
      return compileSatisfying({ realmId: "00000000-0000-4000-a000-000000000018", descriptor, pack: toLoadedWorldPack(result.document), seed: `m18-${pattern}` });
    });
    worlds.forEach((compiled, index) => {
      expect(compiled.constraints.every(value => value.passed)).toBe(true);
      expect(compiled.world.descriptor.decisions).toMatchObject({
        "world.pattern": { value: profiles[index]![0] },
        "world.campaignKit": { value: profiles[index]![1] },
        "world.visualTheme": { value: profiles[index]![2] },
      });
      expect(compiled.world.entities.filter(value => value.kind === "campaign-kit")).toHaveLength(1);
      expect(compiled.world.entities.filter(value => value.kind === "scene")).toHaveLength(6);
      expect(compiled.world.entities.filter(value => value.kind === "npc").length).toBeGreaterThanOrEqual(8);
      expect(compiled.world.entities.filter(value => value.kind === "creature").length).toBeGreaterThanOrEqual(6);
      expect(compiled.world.entities.filter(value => value.kind === "item").length).toBeGreaterThanOrEqual(8);
      expect(compiled.world.entities.some(value => value.values.name?.value === profiles[index]![3])).toBe(true);
    });
    expect(new Set(worlds.map(value => value.world.entities.filter(entity => entity.kind === "scene").map(entity => entity.values.name?.value).join("|"))).size).toBe(3);

    const incompatible = buildDescriptor({ packId: result.document.manifest.id, packVersion: result.document.manifest.version, choices: [
      { path: "world.pattern", value: { mode: "explicit", value: "war-of-heirs" } },
      { path: "world.campaignKit", value: { mode: "explicit", value: "kit.ancient-empire-ruins" } },
      { path: "world.visualTheme", value: { mode: "explicit", value: "visualThemes.1" } },
    ], seed: "m18-incompatible" });
    expect(() => compileSatisfying({ realmId: "00000000-0000-4000-a000-000000000018", descriptor: incompatible, pack: toLoadedWorldPack(result.document), seed: "m18-incompatible" })).toThrow(/Campaign Kit.*does not support pattern/);
  });
});
