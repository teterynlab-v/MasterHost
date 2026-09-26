import { z } from "zod";

const Id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
const Text = z.string().trim().min(1);
const Range = z.object({ min: z.number().int().positive(), max: z.number().int().positive() }).strict().refine(value => value.max >= value.min, "max must be greater than or equal to min");
const Relation = z.object({ type: Text, targetId: Id }).strict();
const Media = z.object({ role: z.enum(["map", "background", "portrait", "token", "item", "ui"]), asset: Text, alt: Text }).strict();

export const deepUniverseMinimums = {
  patterns: 3, campaignKits: 3, factions: 8, locations: 12, npcs: 24,
  adversaries: 18, items: 24, events: 30, scenes: 18, archetypes: 8,
  progressionPaths: 6, visualThemes: 3,
} as const;

export const deepUniverseContentKinds = ["factions", "locations", "npcs", "adversaries", "items", "events", "scenes", "archetypes", "progressionPaths", "visualThemes"] as const;
export type DeepContentKind = typeof deepUniverseContentKinds[number];

export const DeepUniverseContentEntrySchema = z.object({
  id: Id, name: Text, description: Text, patternIds: z.array(Id).min(1),
  relations: z.array(Relation), localeKey: Id, media: z.array(Media),
}).strict();

export const CampaignKitSchema = z.object({
  id: Id, name: Text, summary: Text, durationMinutes: Range, playerCount: Range,
  patternIds: z.array(Id).min(1), requiredCapabilities: z.array(Id), openingSceneId: Id,
  sceneIds: z.array(Id).min(1), npcIds: z.array(Id).min(1), locationIds: z.array(Id).min(1),
  rewardIds: z.array(Id).min(1), gmGuidance: z.array(Text).min(1), readyCharacterIds: z.array(Id).min(1),
}).strict();

export const DeepUniverseProfileSchema = z.object({
  schemaVersion: z.literal("1"), id: Id, genres: z.array(Text).min(1), tones: z.array(Text).min(1),
  complexity: z.enum(["beginner", "intermediate", "advanced"]), recommendedPlayers: Range,
  gameLoop: z.array(z.object({ id: Id, label: Text, ruleRefs: z.array(Text).min(1) }).strict()).min(1),
  patterns: z.array(z.object({ id: Id, name: Text, summary: Text, capabilityRefs: z.array(Id) }).strict()),
  campaignKits: z.array(CampaignKitSchema),
  content: z.object(Object.fromEntries(deepUniverseContentKinds.map(kind => [kind, z.array(DeepUniverseContentEntrySchema)])) as Record<DeepContentKind, z.ZodArray<typeof DeepUniverseContentEntrySchema>>).strict(),
  playToday: z.object({ patternId: Id, campaignKitId: Id, visualThemeId: Id }).strict(),
  localization: z.object({ sourceLocale: Text, supportedLocales: z.array(Text).min(1), fallbackLocales: z.array(Text).optional(), strings: z.record(z.string(), z.record(z.string(), Text)) }).strict(),
}).strict();

export type DeepUniverseProfile = z.infer<typeof DeepUniverseProfileSchema>;
export type CampaignKit = z.infer<typeof CampaignKitSchema>;
export type DeepUniverseContentEntry = z.infer<typeof DeepUniverseContentEntrySchema>;
export interface DeepUniverseDiagnostic { severity: "error" | "warning"; code: string; path: string; message: string }
export interface DeepUniverseAssessment { standardVersion: "1"; passed: boolean; counts: Record<string, { actual: number; required: number }>; diagnostics: DeepUniverseDiagnostic[] }

interface AssessmentDocument {
  manifest?: { license?: { spdx?: string; attribution?: string } };
  content?: { actions?: Record<string, unknown>; checks?: Record<string, unknown>; resources?: Record<string, unknown>; effects?: Record<string, unknown>; progression?: Record<string, unknown>; characterCreation?: unknown };
  assets?: Record<string, unknown>;
  universe?: unknown;
}

type DecisionValue = unknown | { mode?: string; value?: unknown };
const selectedDecision = (document: AssessmentDocument, decisions: Record<string, DecisionValue>, path: string) => {
  const supplied = decisions[path], value = supplied && typeof supplied === "object" && "value" in supplied ? supplied.value : supplied;
  if (typeof value === "string") return value;
  const question = (document.content as any)?.questions?.find((item: any) => item?.id === path);
  return typeof question?.default === "string" ? question.default : undefined;
};

export function validateDeepUniverseDecisions(document: AssessmentDocument, decisions: Record<string, DecisionValue>) {
  const parsed = DeepUniverseProfileSchema.safeParse(document.universe);
  if (!parsed.success) return [] as DeepUniverseDiagnostic[];
  const profile = parsed.data, patternId = selectedDecision(document, decisions, "world.pattern"), kitId = selectedDecision(document, decisions, "world.campaignKit"), themeId = selectedDecision(document, decisions, "world.visualTheme"), diagnostics: DeepUniverseDiagnostic[] = [];
  if (!patternId) return diagnostics;
  const kit = profile.campaignKits.find(value => value.id === kitId);
  if (kitId && (!kit || !kit.patternIds.includes(patternId))) diagnostics.push({ severity: "error", code: "deep-universe.compatibility", path: "world.campaignKit", message: `Campaign Kit ${kitId} does not support pattern ${patternId}` });
  const theme = profile.content.visualThemes.find(value => value.id === themeId);
  if (themeId && (!theme || !theme.patternIds.includes(patternId))) diagnostics.push({ severity: "error", code: "deep-universe.compatibility", path: "world.visualTheme", message: `Visual theme ${themeId} does not support pattern ${patternId}` });
  return diagnostics;
}

const copyMarker = /\b(?:todo|tbd|lorem ipsum|placeholder)\b/i;
const requiredMediaRoles = ["map", "background", "portrait", "token", "item", "ui"] as const;

export function assessDeepUniverse(document: AssessmentDocument): DeepUniverseAssessment {
  const diagnostics: DeepUniverseDiagnostic[] = [], counts: DeepUniverseAssessment["counts"] = {};
  const add = (severity: "error" | "warning", code: string, path: string, message: string) => diagnostics.push({ severity, code, path, message });
  const parsed = DeepUniverseProfileSchema.safeParse(document.universe);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) add("error", "deep-universe.schema", ["universe", ...issue.path].join("."), issue.message);
    return { standardVersion: "1", passed: false, counts, diagnostics };
  }
  const profile = parsed.data;
  counts.patterns = { actual: new Set(profile.patterns.map(value => value.id)).size, required: deepUniverseMinimums.patterns };
  counts.campaignKits = { actual: new Set(profile.campaignKits.map(value => value.id)).size, required: deepUniverseMinimums.campaignKits };
  for (const kind of deepUniverseContentKinds) counts[kind] = { actual: new Set(profile.content[kind].map(value => value.id)).size, required: deepUniverseMinimums[kind] };
  for (const [kind, count] of Object.entries(counts)) if (count.actual < count.required) add("error", "deep-universe.minimum", kind === "patterns" || kind === "campaignKits" ? `universe.${kind}` : `universe.content.${kind}`, `${kind} requires at least ${count.required}; found ${count.actual}`);

  const ids = new Map<string, DeepContentKind>(), patternIds = new Set(profile.patterns.map(value => value.id)), kitIds = new Set(profile.campaignKits.map(value => value.id));
  const reportDuplicates = (values: Array<{ id: string }>, path: string) => {
    const seen = new Set<string>();
    for (const value of values) seen.has(value.id) ? add("error", "deep-universe.duplicate", `${path}.${value.id}`, `Duplicate ID ${value.id}`) : seen.add(value.id);
  };
  reportDuplicates(profile.patterns, "universe.patterns");
  reportDuplicates(profile.campaignKits, "universe.campaignKits");
  for (const kind of deepUniverseContentKinds) for (const entry of profile.content[kind]) {
    if (ids.has(entry.id)) add("error", "deep-universe.reference", `universe.content.${kind}.${entry.id}`, `Duplicate content ID ${entry.id}`);
    ids.set(entry.id, kind);
  }
  for (const pattern of profile.patterns) if (copyMarker.test(pattern.name) || copyMarker.test(pattern.summary) || pattern.summary.length < 20) add("error", "deep-universe.copy", `universe.patterns.${pattern.id}`, `Pattern ${pattern.id} needs meaningful final copy`);
  const descriptions = new Map<string, string[]>();
  for (const kind of deepUniverseContentKinds) for (const entry of profile.content[kind]) {
    const path = `universe.content.${kind}.${entry.id}`;
    if (copyMarker.test(entry.name) || copyMarker.test(entry.description) || entry.description.length < 20) add("error", "deep-universe.copy", path, `${entry.id} needs meaningful final copy`);
    const normalized = entry.description.trim().toLowerCase();
    descriptions.set(normalized, [...descriptions.get(normalized) ?? [], entry.id]);
    for (const patternId of entry.patternIds) if (!patternIds.has(patternId)) add("error", "deep-universe.reference", `${path}.patternIds`, `Missing pattern ${patternId}`);
    for (const relation of entry.relations) if (!ids.has(relation.targetId)) add("error", "deep-universe.reference", `${path}.relations`, `Missing relation target ${relation.targetId}`);
    if ((kind === "factions" || kind === "npcs" || kind === "locations") && !entry.relations.some(relation => relation.targetId !== entry.id && ids.has(relation.targetId))) add("error", "deep-universe.disconnected", `${path}.relations`, `${entry.id} must connect to another content entry`);
    for (const media of entry.media) {
      if (!media.alt.trim()) add("error", "deep-universe.media", `${path}.media`, `${media.asset} requires alternative text`);
      if (!document.assets?.[media.asset]) add("error", "deep-universe.media", `${path}.media`, `Missing Pack asset ${media.asset}`);
    }
    for (const locale of profile.localization.supportedLocales) if (!profile.localization.strings[locale]?.[entry.localeKey]?.trim()) { const fallback = locale !== profile.localization.sourceLocale && profile.localization.fallbackLocales?.includes(locale) && !!profile.localization.strings[profile.localization.sourceLocale]?.[entry.localeKey]?.trim(); add(fallback ? "warning" : "error", fallback ? "deep-universe.locale-fallback" : "deep-universe.locale", `${path}.localeKey`, fallback ? `${locale} uses ${profile.localization.sourceLocale} fallback for ${entry.localeKey}; translation pending` : `Missing ${locale} string for ${entry.localeKey}`); }
  }
  for (const [description, entryIds] of descriptions) if (description && entryIds.length > 1) add("warning", "deep-universe.repetition", "universe.content", `Repeated description used by ${entryIds.join(", ")}`);

  const refLists: Array<[CampaignKit, "sceneIds" | "npcIds" | "locationIds" | "rewardIds" | "readyCharacterIds", DeepContentKind]> = [];
  for (const kit of profile.campaignKits) {
    const path = `universe.campaignKits.${kit.id}`;
    if (copyMarker.test(kit.name) || copyMarker.test(kit.summary) || kit.summary.length < 20 || kit.gmGuidance.some(value => copyMarker.test(value))) add("error", "deep-universe.copy", path, `Campaign Kit ${kit.id} needs meaningful final copy`);
    for (const patternId of kit.patternIds) if (!patternIds.has(patternId)) add("error", "deep-universe.reference", `${path}.patternIds`, `Missing pattern ${patternId}`);
    const capabilities = new Set(profile.patterns.filter(pattern => kit.patternIds.includes(pattern.id)).flatMap(pattern => pattern.capabilityRefs));
    for (const capability of kit.requiredCapabilities) if (!capabilities.has(capability)) add("error", "deep-universe.reference", `${path}.requiredCapabilities`, `Selected patterns do not provide ${capability}`);
    refLists.push([kit, "sceneIds", "scenes"], [kit, "npcIds", "npcs"], [kit, "locationIds", "locations"], [kit, "rewardIds", "items"], [kit, "readyCharacterIds", "archetypes"]);
    if (!kit.sceneIds.includes(kit.openingSceneId)) add("error", "deep-universe.reference", `${path}.openingSceneId`, `Opening scene ${kit.openingSceneId} is not in sceneIds`);
  }
  for (const [kit, field, kind] of refLists) for (const id of kit[field]) {
    const path = `universe.campaignKits.${kit.id}.${field}`;
    if (ids.get(id) !== kind) add("error", "deep-universe.reference", path, `Missing ${kind} entry ${id}`);
    else {
      const entry = profile.content[kind].find(value => value.id === id)!;
      if (!entry.patternIds.some(patternId => kit.patternIds.includes(patternId))) add("error", "deep-universe.compatibility", path, `${id} is not compatible with Campaign Kit patterns`);
    }
  }

  const ruleGroups: Record<string, Record<string, unknown> | undefined> = { action: document.content?.actions, check: document.content?.checks, resource: document.content?.resources, effect: document.content?.effects, progression: document.content?.progression };
  for (const step of profile.gameLoop) for (const ref of step.ruleRefs) {
    const [group, id] = ref.split(":", 2);
    if (!id || !ruleGroups[group]?.[id]) add("error", "deep-universe.rule", `universe.gameLoop.${step.id}.ruleRefs`, `Missing runtime rule ${ref}`);
  }
  if (!document.content?.characterCreation) add("error", "deep-universe.character", "content.characterCreation", "Deep universes require Character creation");
  if (!Object.keys(document.content?.progression ?? {}).length) add("error", "deep-universe.character", "content.progression", "Deep universes require progression rules");
  if (!document.manifest?.license?.spdx || !document.manifest.license.attribution) add("error", "deep-universe.license", "manifest.license", "Deep universes require license and attribution");
  const availableRoles = new Set(deepUniverseContentKinds.flatMap(kind => profile.content[kind].flatMap(entry => entry.media.map(media => media.role))));
  for (const role of requiredMediaRoles) if (!availableRoles.has(role)) add("error", "deep-universe.media", "universe.content", `Missing baseline ${role} media`);
  if (!profile.localization.supportedLocales.includes(profile.localization.sourceLocale)) add("error", "deep-universe.locale", "universe.localization.sourceLocale", "Source locale must be supported");
  if (!patternIds.has(profile.playToday.patternId)) add("error", "deep-universe.reference", "universe.playToday.patternId", `Missing pattern ${profile.playToday.patternId}`);
  if (!kitIds.has(profile.playToday.campaignKitId)) add("error", "deep-universe.reference", "universe.playToday.campaignKitId", `Missing Campaign Kit ${profile.playToday.campaignKitId}`);
  if (ids.get(profile.playToday.visualThemeId) !== "visualThemes") add("error", "deep-universe.reference", "universe.playToday.visualThemeId", `Missing visual theme ${profile.playToday.visualThemeId}`);
  const playKit = profile.campaignKits.find(value => value.id === profile.playToday.campaignKitId);
  if (playKit && !playKit.patternIds.includes(profile.playToday.patternId)) add("error", "deep-universe.compatibility", "universe.playToday.campaignKitId", `Campaign Kit ${playKit.id} does not support pattern ${profile.playToday.patternId}`);
  const playTheme = profile.content.visualThemes.find(value => value.id === profile.playToday.visualThemeId);
  if (playTheme && !playTheme.patternIds.includes(profile.playToday.patternId)) add("error", "deep-universe.compatibility", "universe.playToday.visualThemeId", `Visual theme ${playTheme.id} does not support pattern ${profile.playToday.patternId}`);
  return { standardVersion: "1", passed: diagnostics.every(value => value.severity !== "error"), counts, diagnostics };
}
