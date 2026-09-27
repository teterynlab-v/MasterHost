import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { assessDeepUniverse, buildCharacterState, loadUniverseCatalog, loadWorldPack, resolveUniverseCatalog, toLoadedWorldPack, worldPackDocumentFromLoaded } from "@masterhost/worldpack-sdk";
import { buildDescriptor, composeGameDescriptor, gameAssetFragments, loadGameAssetRegistry, quickGameAssetTypes, reviewQuickGameSelection } from "@masterhost/descriptor";
import { compileSatisfying } from "@masterhost/world-compiler";

describe("M20 Deep Cyberpunk", () => {
  it("loads the installed 2.0.0 profile into a portable document and ready catalog entry", async () => {
    const pack = await loadWorldPack(resolve("worldpacks/cyberpunk"));
    expect(pack.manifest).toMatchObject({ id: "masterhost.cyberpunk", version: "2.0.0" });
    expect(pack.universe).toMatchObject({ id: "cyberpunk", playToday: { patternId: "rainline-mutual" } });
    expect(pack.universe!.localization.supportedLocales).toEqual(["en", "ru", "es", "ja", "zh-CN", "ko"]);
    const localeKeys = Object.keys(pack.universe!.localization.strings.en).sort();
    expect(localeKeys).toHaveLength(151);
    expect(pack.universe!.localization.fallbackLocales).toEqual(["ru", "es", "ja", "zh-CN", "ko"]);
    for (const locale of pack.universe!.localization.fallbackLocales!) expect(pack.universe!.localization.strings[locale] ?? {}).toEqual({});
    const creation=pack.content.characterCreation!;
    const fields=creation.steps.flatMap(step=>step.fields);
    expect(fields.find(field=>field.id==="archetype")?.options?.map(option=>option.value)).toEqual(pack.universe!.content.archetypes.map(entry=>entry.id));
    expect(fields.find(field=>field.id==="path")?.options).toHaveLength(6);
    for(const entry of pack.universe!.content.progressionPaths) expect(pack.content.progression?.[entry.id]).toMatchObject({label:entry.name,default:0});
    for(const archetype of pack.universe!.content.archetypes) for(const path of pack.universe!.content.progressionPaths) {
      const state=buildCharacterState(creation,{name:"Crew Member",calling:"solo",archetype:archetype.id,path:path.id});
      expect(state.traits).toContain(`role-${archetype.id}`); expect(state.traits).toContain(`path-${path.id}`); expect(state.progression[path.id]).toBe(0);
    }
    const document = await worldPackDocumentFromLoaded(pack, { terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#d9b45b", accent: "#739b68", background: "#101713" } });
    expect(assessDeepUniverse(document).passed).toBe(true);
    expect(assessDeepUniverse(document).diagnostics.some(d=>d.code==="deep-universe.locale-fallback")).toBe(true);
    const catalog = await loadUniverseCatalog();
    expect(resolveUniverseCatalog(catalog, [document]).find(item => item.id === "cyberpunk")).toMatchObject({ availability: "ready", playToday: { patternId: "rainline-mutual" } });
  });

  it("retains the exact official 1.0.0 release alongside the deep 2.0.0 release", async () => {
    const [legacy, deep] = await Promise.all([loadWorldPack(resolve("worldpacks/cyberpunk-v1")), loadWorldPack(resolve("worldpacks/cyberpunk"))]);
    expect(legacy.manifest).toMatchObject({ id: "masterhost.cyberpunk", version: "1.0.0" });
    expect(deep.manifest).toMatchObject({ id: "masterhost.cyberpunk", version: "2.0.0" });
    expect(legacy.universe).toBeUndefined();
    expect(deep.universe?.patterns).toHaveLength(3);
  });

  it("ships a complete Quick selection that also composes in Advanced mode", async () => {
    const assets = await loadGameAssetRegistry(resolve("game-assets/library"));
    const selected = assets.filter(asset => asset.preview.highlights.includes("Deep Universe Standard v1")).filter(asset => asset.id.startsWith("masterhost.asset.cyber.")).map(asset => ({ id: asset.id, version: asset.version }));
    const review = reviewQuickGameSelection(assets, "masterhost.cyberpunk", selected);
    expect(review).toMatchObject({ ready: true, diagnostics: [] });
    expect(review.selected).toHaveLength(quickGameAssetTypes.length);
    expect(review.counts).toMatchObject({ locations: 12, actors: 42, items: 24, scenes: 18, archetypes: 8, rules: 6, media: 6 });
    const base = await worldPackDocumentFromLoaded(await loadWorldPack(resolve("worldpacks/cyberpunk")), { terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#d9b45b", accent: "#739b68", background: "#101713" } });
    const result = composeGameDescriptor({ projectId: "m20-space", revision: 1, name: "Who Owns the Water", base, fragments: gameAssetFragments(assets), selections: review.orderedSelections.map(value => ({ fragmentId: value.id, version: value.version, parameters: {} })) });
    expect(result.report.valid, JSON.stringify(result.report.diagnostics)).toBe(true);
    expect(result.document.universe?.playToday).toMatchObject({ patternId: "rainline-mutual", campaignKitId: "kit.rainline-mutual" });
    expect(result.document.manifest).toMatchObject({ id: "masterhost.game.m20-space", name: "Who Owns the Water" });

    const profiles = [
      ["rainline-mutual", "kit.rainline-mutual", "visualThemes.1", "Water Behind the Lock"],
      ["glass-house", "kit.glass-house", "visualThemes.2", "The Wrong Name"],
      ["ghost-transit", "kit.ghost-transit", "visualThemes.3", "A Train for the Missing"],
    ] as const;
    const worlds = profiles.map(([pattern, campaignKit, visualTheme]) => {
      const decisions = { "world.pattern": pattern, "world.campaignKit": campaignKit, "world.visualTheme": visualTheme };
      const descriptor = buildDescriptor({ packId: result.document.manifest.id, packVersion: result.document.manifest.version, choices: Object.entries(decisions).map(([path, value]) => ({ path, value: { mode: "explicit" as const, value } })), seed: `m20-${pattern}` });
      return compileSatisfying({ realmId: "00000000-0000-4000-a000-000000000020", descriptor, pack: toLoadedWorldPack(result.document), seed: `m20-${pattern}` });
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
      { path: "world.pattern", value: { mode: "explicit", value: "glass-house" } },
      { path: "world.campaignKit", value: { mode: "explicit", value: "kit.ghost-transit" } },
      { path: "world.visualTheme", value: { mode: "explicit", value: "visualThemes.1" } },
    ], seed: "m20-incompatible" });
    expect(() => compileSatisfying({ realmId: "00000000-0000-4000-a000-000000000020", descriptor: incompatible, pack: toLoadedWorldPack(result.document), seed: "m20-incompatible" })).toThrow(/Campaign Kit.*does not support pattern/);
  });
});
