import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { assessDeepUniverse, buildCharacterState, loadUniverseCatalog, loadWorldPack, resolveUniverseCatalog, toLoadedWorldPack, worldPackDocumentFromLoaded } from "@masterhost/worldpack-sdk";
import { buildDescriptor, composeGameDescriptor, gameAssetFragments, loadGameAssetRegistry, quickGameAssetTypes, reviewQuickGameSelection } from "@masterhost/descriptor";
import { compileSatisfying } from "@masterhost/world-compiler";

describe("M27 Deep Cosmic Investigation", () => {
  it("loads the installed 1.0.0 profile into a portable document and ready catalog entry", async () => {
    const pack = await loadWorldPack(resolve("worldpacks/cosmic-investigation"));
    expect(pack.manifest).toMatchObject({ id: "masterhost.cosmic-investigation", version: "1.0.0" });
    expect(pack.universe).toMatchObject({ id: "cosmic-investigation", complexity: "advanced", playToday: { patternId: "coastal-university" } });
    expect(pack.universe!.localization.supportedLocales).toEqual(["en", "ru", "es", "ja", "zh-CN", "ko"]);
    const localeKeys = Object.keys(pack.universe!.localization.strings.en).sort();
    expect(localeKeys).toHaveLength(151);
    expect(pack.universe!.localization.fallbackLocales).toEqual(["ru", "es", "ja", "zh-CN", "ko"]);
    for (const locale of pack.universe!.localization.fallbackLocales!) expect(pack.universe!.localization.strings[locale] ?? {}).toEqual({});
    expect(pack.content.resources?.exposure.default).toBe(0);
    expect(pack.content.actions?.pressure).toMatchObject({label:"Mark Exposure",operation:"add",resource:"exposure",amount:1});
    expect(pack.content.actions?.["contain-exposure"]).toMatchObject({label:"Reduce Exposure",operation:"subtract",resource:"exposure",amount:1});
    expect(pack.content.actorTemplates?.contact.label).toBe("Tide Technician");
    expect(pack.content.actorTemplates?.elite.label).toBe("Threshold Figure");
    const creation=pack.content.characterCreation!;
    const fields=creation.steps.flatMap(step=>step.fields);
    expect(fields.find(field=>field.id==="archetype")?.options?.map(option=>option.value)).toEqual(pack.universe!.content.archetypes.map(entry=>entry.id));
    expect(fields.find(field=>field.id==="path")?.options).toHaveLength(6);
    for(const entry of pack.universe!.content.progressionPaths) expect(pack.content.progression?.[entry.id]).toMatchObject({label:entry.name,default:0});
    for(const archetype of pack.universe!.content.archetypes) for(const path of pack.universe!.content.progressionPaths) {
      const state=buildCharacterState(creation,{name:"Crew Member",calling:"fieldworker",archetype:archetype.id,path:path.id});
      expect(state.traits).toContain(`role-${archetype.id}`); expect(state.traits).toContain(`path-${path.id}`); expect(state.progression[path.id]).toBe(0);
    }
    const document = await worldPackDocumentFromLoaded(pack, { terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#d9b45b", accent: "#739b68", background: "#101713" } });
    expect(assessDeepUniverse(document).passed).toBe(true);
    expect(assessDeepUniverse(document).diagnostics.some(d=>d.code==="deep-universe.locale-fallback")).toBe(true);
    const catalog = await loadUniverseCatalog();
    expect(resolveUniverseCatalog(catalog, [document]).find(item => item.id === "cosmic-investigation")).toMatchObject({ availability: "ready", playToday: { patternId: "coastal-university" } });
  });

  it("ships a complete Quick selection that also composes in Advanced mode", async () => {
    const assets = await loadGameAssetRegistry(resolve("game-assets/library"));
    const selected = assets.filter(asset => asset.preview.highlights.includes("Deep Universe Standard v1")).filter(asset => asset.id.startsWith("masterhost.asset.cosmic.")).map(asset => ({ id: asset.id, version: asset.version }));
    const review = reviewQuickGameSelection(assets, "masterhost.cosmic-investigation", selected);
    expect(review).toMatchObject({ ready: true, diagnostics: [] });
    expect(review.selected).toHaveLength(quickGameAssetTypes.length);
    expect(review.counts).toMatchObject({ locations: 12, actors: 42, items: 24, scenes: 18, archetypes: 8, rules: 6, media: 6 });
    const base = await worldPackDocumentFromLoaded(await loadWorldPack(resolve("worldpacks/cosmic-investigation")), { terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#d9b45b", accent: "#739b68", background: "#101713" } });
    const result = composeGameDescriptor({ projectId: "m27-space", revision: 1, name: "A Road Kept Open", base, fragments: gameAssetFragments(assets), selections: review.orderedSelections.map(value => ({ fragmentId: value.id, version: value.version, parameters: {} })) });
    expect(result.report.valid, JSON.stringify(result.report.diagnostics)).toBe(true);
    expect(result.document.universe?.playToday).toMatchObject({ patternId: "coastal-university", campaignKitId: "kit.coastal-university" });
    expect(result.document.manifest).toMatchObject({ id: "masterhost.game.m27-space", name: "A Road Kept Open" });

    const profiles = [
      ["coastal-university", "kit.coastal-university", "visualThemes.1", "The Page Lost on Schedule"],
      ["polar-expedition", "kit.polar-expedition", "visualThemes.2", "Heat beneath Unmelted Ice"],
      ["decaying-metropolis", "kit.decaying-metropolis", "visualThemes.3", "A Call from Nowhere"],
    ] as const;
    const worlds = profiles.map(([pattern, campaignKit, visualTheme]) => {
      const decisions = { "world.pattern": pattern, "world.campaignKit": campaignKit, "world.visualTheme": visualTheme };
      const descriptor = buildDescriptor({ packId: result.document.manifest.id, packVersion: result.document.manifest.version, choices: Object.entries(decisions).map(([path, value]) => ({ path, value: { mode: "explicit" as const, value } })), seed: `m27-${pattern}` });
      return compileSatisfying({ realmId: "00000000-0000-4000-a000-000000000022", descriptor, pack: toLoadedWorldPack(result.document), seed: `m27-${pattern}` });
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
      { path: "world.pattern", value: { mode: "explicit", value: "polar-expedition" } },
      { path: "world.campaignKit", value: { mode: "explicit", value: "kit.decaying-metropolis" } },
      { path: "world.visualTheme", value: { mode: "explicit", value: "visualThemes.1" } },
    ], seed: "m27-incompatible" });
    expect(() => compileSatisfying({ realmId: "00000000-0000-4000-a000-000000000022", descriptor: incompatible, pack: toLoadedWorldPack(result.document), seed: "m27-incompatible" })).toThrow(/Campaign Kit.*does not support pattern/);
  });
});
