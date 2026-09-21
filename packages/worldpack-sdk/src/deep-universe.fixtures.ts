import { createStarterPack, type WorldPackDocument } from "./authoring.js";
import { deepUniverseContentKinds, deepUniverseMinimums } from "./deep-universe.js";

const locales = ["en", "ru", "es", "ja", "zh-CN", "ko"];
const mediaRoles = ["map", "background", "portrait", "token", "item", "ui"] as const;

/** Deterministic complete document for contract and acceptance tests. */
export function completeDeepUniverseDocument(pack: { id: string; version: string }): WorldPackDocument {
  const document = createStarterPack({ realmId: "fixture", id: pack.id, version: pack.version, name: "Deep Universe Fixture" }).document;
  document.manifest.license = { spdx: "MIT", attribution: "MasterHost contributors" };
  document.content.actions!.explore = { label: "Explore", kind: "check", target: "self", checkId: "challenge" };
  for (const role of mediaRoles) document.assets[`${role}.svg`] = { mediaType: "image/svg+xml", checksum: "0".repeat(64), size: 1 };
  const content = {} as Record<typeof deepUniverseContentKinds[number], any[]>;
  const localeKeys: string[] = [];
  for (const kind of deepUniverseContentKinds) {
    content[kind] = Array.from({ length: deepUniverseMinimums[kind] }, (_, index) => {
      const id = `${kind}.${index + 1}`, localeKey = `content.${id}`;
      localeKeys.push(localeKey);
      return { id, name: `${kind} ${index + 1}`, description: `A distinct ${kind} entry with enough useful play detail number ${index + 1}.`, patternIds: [`pattern.${index % 3 + 1}`], relations: [{ type: "supports", targetId: "factions.1" }], localeKey, media: [{ role: mediaRoles[index % mediaRoles.length], asset: `${mediaRoles[index % mediaRoles.length]}.svg`, alt: `${kind} ${index + 1}` }] };
    });
  }
  content.factions[0].relations = [{ type: "employs", targetId: "npcs.1" }];
  document.universe = {
    schemaVersion: "1", id: pack.id.replace(/^masterhost\./, ""), genres: ["adventure"], tones: ["hopeful", "dangerous"], complexity: "beginner", recommendedPlayers: { min: 2, max: 5 },
    gameLoop: [{ id: "explore", label: "Explore the frontier", ruleRefs: ["action:explore", "check:challenge"] }],
    patterns: Array.from({ length: 3 }, (_, index) => ({ id: `pattern.${index + 1}`, name: `Pattern ${index + 1}`, summary: `A distinct playable pattern number ${index + 1}.`, capabilityRefs: ["core.play"] })),
    campaignKits: Array.from({ length: 3 }, (_, index) => ({ id: `kit.${index + 1}`, name: `Campaign Kit ${index + 1}`, summary: `A complete three to four hour campaign framework number ${index + 1}.`, durationMinutes: { min: 180, max: 240 }, playerCount: { min: 2, max: 5 }, patternIds: [`pattern.${index + 1}`], requiredCapabilities: ["core.play"], openingSceneId: `scenes.${index + 1}`, sceneIds: [`scenes.${index + 1}`, `scenes.${index + 4}`], npcIds: [`npcs.${index + 1}`], locationIds: [`locations.${index + 1}`], rewardIds: [`items.${index + 1}`], gmGuidance: ["Frame the opening conflict clearly.", "Offer two consequential choices."], readyCharacterIds: [`archetypes.${index + 1}`] })),
    content,
    playToday: { patternId: "pattern.1", campaignKitId: "kit.1", visualThemeId: "visualThemes.1" },
    localization: { sourceLocale: "en", supportedLocales: locales, strings: Object.fromEntries(locales.map(locale => [locale, Object.fromEntries(localeKeys.map(key => [key, `${locale} ${key}`]))])) },
  };
  return document;
}
