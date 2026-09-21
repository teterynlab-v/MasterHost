import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import type { WorldPackDocument } from "./authoring.js";
import { assessDeepUniverse, type DeepUniverseAssessment, type DeepUniverseProfile } from "./deep-universe.js";

const Id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);
const Text = z.string().trim().min(1);
export const UniverseCatalogEntrySchema = z.object({
  id: Id, name: Text, summary: Text, genres: z.array(Text).min(1), tones: z.array(Text).min(1),
  complexity: z.enum(["beginner", "intermediate", "advanced"]),
  recommendedPlayers: z.object({ min: z.number().int().positive(), max: z.number().int().positive() }).strict(),
  gameLoop: z.array(Text).min(3),
  patterns: z.array(z.object({ id: Id, name: Text, summary: Text }).strict()).length(3),
  targetPack: z.object({ id: z.string().min(1), version: z.string().min(1) }).strict(),
}).strict();
export type UniverseCatalogEntry = z.infer<typeof UniverseCatalogEntrySchema>;
export interface UniverseCatalogItem extends UniverseCatalogEntry { availability: "planned" | "ready"; assessment?: DeepUniverseAssessment; playToday?: DeepUniverseProfile["playToday"] }

export function parseUniverseCatalog(input: unknown): UniverseCatalogEntry[] {
  const entries = z.array(UniverseCatalogEntrySchema).length(12).parse(input);
  const universeIds = new Set<string>();
  for (const entry of entries) {
    if (universeIds.has(entry.id)) throw Error(`Duplicate universe ID ${entry.id}`);
    universeIds.add(entry.id);
    const patternIds = new Set<string>();
    for (const pattern of entry.patterns) {
      if (patternIds.has(pattern.id)) throw Error(`Duplicate pattern ID ${pattern.id} in ${entry.id}`);
      patternIds.add(pattern.id);
    }
  }
  return entries;
}

export async function loadUniverseCatalog(path = resolve(process.cwd(), "universe-catalog/catalog.json")): Promise<UniverseCatalogEntry[]> {
  return parseUniverseCatalog(JSON.parse(await readFile(path, "utf8")));
}

export function resolveUniverseCatalog(entries: UniverseCatalogEntry[], documents: WorldPackDocument[]): UniverseCatalogItem[] {
  return entries.map(entry => {
    const document = documents.find(candidate => candidate.manifest.id === entry.targetPack.id && candidate.manifest.version === entry.targetPack.version);
    if (!document?.universe) return { ...entry, availability: "planned" };
    const assessment = assessDeepUniverse(document);
    return assessment.passed ? { ...entry, availability: "ready", assessment, playToday: document.universe.playToday } : { ...entry, availability: "planned", assessment };
  });
}
