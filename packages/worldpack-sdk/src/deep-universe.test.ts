import { describe, expect, it } from "vitest";
import { createStarterPack, validateWorldPackDocument } from "./authoring.js";
import { assessDeepUniverse, DeepUniverseProfileSchema, deepUniverseMinimums, validateDeepUniverseDecisions } from "./deep-universe.js";

const locales = ["en", "ru", "es", "ja", "zh-CN", "ko"];
const kinds = ["factions", "locations", "npcs", "adversaries", "items", "events", "scenes", "archetypes", "progressionPaths", "visualThemes"] as const;
const mediaRoles = ["map", "background", "portrait", "token", "item", "ui"] as const;

function completeDocument() {
  const document = createStarterPack({ realmId: "realm", id: "masterhost.deep-test", name: "Deep Test" }).document as any;
  document.manifest.license = { spdx: "MIT", attribution: "MasterHost contributors" };
  for (const role of mediaRoles) document.assets[`${role}.svg`] = { mediaType: "image/svg+xml", checksum: "0".repeat(64), size: 1 };
  document.content.actions.explore = { label: "Explore", kind: "check", target: "self", checkId: "challenge" };
  const content: Record<string, any[]> = {};
  const allIds: string[] = [];
  for (const kind of kinds) {
    const count = deepUniverseMinimums[kind];
    content[kind] = Array.from({ length: count }, (_, index) => {
      const id = `${kind}.${index + 1}`;
      allIds.push(id);
      const role = mediaRoles[index % mediaRoles.length];
      return {
        id,
        name: `${kind} ${index + 1}`,
        description: `A distinct ${kind} entry with enough useful play detail number ${index + 1}.`,
        patternIds: [`pattern.${index % 3 + 1}`],
        relations: [{ type: "supports", targetId: "factions.1" }],
        localeKey: `content.${id}`,
        media: [{ role, asset: `${role}.svg`, alt: `${kind} ${index + 1} ${role}` }],
      };
    });
  }
  content.factions[0].relations = [{ type: "employs", targetId: "npcs.1" }];
  const strings = Object.fromEntries(locales.map(locale => [locale, Object.fromEntries(allIds.map(id => [`content.${id}`, `${locale} ${id}`]))]));
  document.universe = {
    schemaVersion: "1",
    id: "deep-test",
    genres: ["science fantasy"],
    tones: ["hopeful", "dangerous"],
    complexity: "beginner",
    recommendedPlayers: { min: 2, max: 5 },
    gameLoop: [{ id: "explore", label: "Explore the frontier", ruleRefs: ["action:explore", "check:challenge"] }],
    patterns: Array.from({ length: 3 }, (_, index) => ({ id: `pattern.${index + 1}`, name: `Pattern ${index + 1}`, summary: `A distinct playable pattern number ${index + 1}.`, capabilityRefs: ["core.play"] })),
    campaignKits: Array.from({ length: 3 }, (_, index) => ({
      id: `kit.${index + 1}`,
      name: `Campaign Kit ${index + 1}`,
      summary: `A complete three to four hour campaign framework number ${index + 1}.`,
      durationMinutes: { min: 180, max: 240 },
      playerCount: { min: 2, max: 5 },
      patternIds: [`pattern.${index + 1}`],
      requiredCapabilities: ["core.play"],
      openingSceneId: `scenes.${index + 1}`,
      sceneIds: [`scenes.${index + 1}`, `scenes.${index + 4}`],
      npcIds: [`npcs.${index + 1}`],
      locationIds: [`locations.${index + 1}`],
      rewardIds: [`items.${index + 1}`],
      gmGuidance: ["Frame the opening conflict clearly.", "Offer two consequential choices."],
      readyCharacterIds: [`archetypes.${index + 1}`],
    })),
    content,
    playToday: { patternId: "pattern.1", campaignKitId: "kit.1", visualThemeId: "visualThemes.1" },
    localization: { sourceLocale: "en", supportedLocales: locales, strings },
  };
  return document;
}

describe("Deep Universe Standard v1", () => {
  it("accepts a complete profile at every required minimum", () => {
    const document = completeDocument();
    expect(DeepUniverseProfileSchema.parse(document.universe).id).toBe("deep-test");
    expect(assessDeepUniverse(document)).toMatchObject({ passed: true, diagnostics: [] });
  });

  it("reports a missing minimum at the affected content path", () => {
    const document = completeDocument();
    document.universe.content.factions.pop();
    expect(assessDeepUniverse(document).diagnostics).toContainEqual(expect.objectContaining({ code: "deep-universe.minimum", path: "universe.content.factions" }));
  });

  it("reports dangling Campaign Kit references", () => {
    const document = completeDocument();
    document.universe.campaignKits[0].sceneIds.push("scenes.missing");
    expect(assessDeepUniverse(document).diagnostics).toContainEqual(expect.objectContaining({ code: "deep-universe.reference", path: "universe.campaignKits.kit.1.sceneIds" }));
  });

  it("rejects marker copy and disconnected core content", () => {
    const document = completeDocument();
    document.universe.content.npcs[0].description = "TODO";
    document.universe.content.locations[0].relations = [];
    expect(new Set(assessDeepUniverse(document).diagnostics.map(item => item.code))).toEqual(expect.objectContaining(new Set(["deep-universe.copy", "deep-universe.disconnected"])));
  });

  it("reports missing runtime rules and locale strings", () => {
    const document = completeDocument();
    document.universe.gameLoop[0].ruleRefs.push("action:missing");
    delete document.universe.localization.strings.ru["content.npcs.1"];
    expect(new Set(assessDeepUniverse(document).diagnostics.map(item => item.code))).toEqual(expect.objectContaining(new Set(["deep-universe.rule", "deep-universe.locale"])));
  });

  it("keeps legacy Pack documents valid when deep metadata is absent", () => {
    const project = createStarterPack({ realmId: "realm", id: "masterhost.legacy", name: "Legacy" });
    expect(validateWorldPackDocument(project.document, project.assetData)).toMatchObject({ valid: true, diagnostics: [] });
  });

  it("rejects duplicate pattern and Campaign Kit identities", () => {
    const document = completeDocument();
    document.universe.patterns[1].id = document.universe.patterns[0].id;
    document.universe.campaignKits[1].id = document.universe.campaignKits[0].id;
    const assessment = assessDeepUniverse(document);
    expect(assessment.passed).toBe(false);
    expect(assessment.diagnostics.filter(item => item.code === "deep-universe.duplicate")).toHaveLength(2);
  });

  it("rejects self-only relations and kit content outside its patterns", () => {
    const document = completeDocument();
    document.universe.content.factions[0].relations = [{ type: "echoes", targetId: "factions.1" }];
    document.universe.campaignKits[0].sceneIds = ["scenes.2"];
    document.universe.campaignKits[0].openingSceneId = "scenes.2";
    const assessment = assessDeepUniverse(document);
    expect(assessment.passed).toBe(false);
    expect(assessment.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "deep-universe.disconnected", path: "universe.content.factions.factions.1.relations" }),
      expect.objectContaining({ code: "deep-universe.compatibility", path: "universe.campaignKits.kit.1.sceneIds" }),
    ]));
  });

  it("rejects a Play Today kit or theme incompatible with its pattern", () => {
    const document = completeDocument();
    document.universe.playToday.campaignKitId = "kit.2";
    document.universe.playToday.visualThemeId = "visualThemes.3";
    const assessment = assessDeepUniverse(document);
    expect(assessment.passed).toBe(false);
    expect(assessment.diagnostics.filter(item => item.code === "deep-universe.compatibility").length).toBeGreaterThanOrEqual(2);
  });

  it("rejects Descriptor choices that combine a pattern with another kit or theme", () => {
    const document = completeDocument();
    document.content.questions.push(
      { id: "world.pattern", label: "Pattern", type: "choice", default: "pattern.1", options: [] },
      { id: "world.campaignKit", label: "Kit", type: "choice", default: "kit.1", options: [] },
      { id: "world.visualTheme", label: "Theme", type: "choice", default: "visualThemes.1", options: [] },
    );
    expect(validateDeepUniverseDecisions(document, { "world.pattern": "pattern.2", "world.campaignKit": "kit.1", "world.visualTheme": "visualThemes.3" })).toEqual([
      expect.objectContaining({ code: "deep-universe.compatibility", path: "world.campaignKit" }),
      expect.objectContaining({ code: "deep-universe.compatibility", path: "world.visualTheme" }),
    ]);
    expect(validateDeepUniverseDecisions(document, { "world.pattern": { mode: "explicit", value: "pattern.2" }, "world.campaignKit": { mode: "explicit", value: "kit.2" }, "world.visualTheme": { mode: "explicit", value: "visualThemes.2" } })).toEqual([]);
  });
});
