import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { completeDeepUniverseDocument } from "./deep-universe.fixtures.js";
import { parseUniverseCatalog, resolveUniverseCatalog } from "./universe-catalog.js";

async function catalog() {
  return parseUniverseCatalog(JSON.parse(await readFile(resolve(process.cwd(), "universe-catalog/catalog.json"), "utf8")));
}
function matchingDocument(entry: Awaited<ReturnType<typeof catalog>>[number]) {
  const document = completeDeepUniverseDocument(entry.targetPack), oldIds = document.universe!.patterns.map(pattern => pattern.id);
  const remap = new Map(oldIds.map((id, index) => [id, entry.patterns[index]!.id]));
  document.universe!.patterns.forEach((pattern, index) => Object.assign(pattern, entry.patterns[index]));
  for (const kit of document.universe!.campaignKits) kit.patternIds = kit.patternIds.map(id => remap.get(id)!);
  for (const entries of Object.values(document.universe!.content)) for (const item of entries) item.patternIds = item.patternIds.map(id => remap.get(id)!);
  document.universe!.playToday.patternId = entry.patterns[0]!.id;
  return document;
}

describe("M17 universe catalog", () => {
  it("contains the twelve approved universes, patterns, and game loops", async () => {
    const entries = await catalog();
    expect(entries).toHaveLength(12);
    expect(new Set(entries.map(entry => entry.id)).size).toBe(12);
    expect(entries.find(entry => entry.id === "classic-fantasy")?.patterns.map(pattern => pattern.name)).toEqual(["Border Kingdoms", "War of Heirs", "Ruins of the Ancient Empire"]);
    expect(entries.find(entry => entry.id === "mecha-kaiju")?.gameLoop).toEqual(["alarm", "machine preparation", "operation", "damage and pilot bonds"]);
  });

  it("rejects duplicate universe and pattern identities", async () => {
    const entries = await catalog();
    expect(() => parseUniverseCatalog([...entries.slice(0, -1), entries[0]])).toThrow(/duplicate universe ID/i);
    const broken = structuredClone(entries);
    broken[0].patterns[1].id = broken[0].patterns[0].id;
    expect(() => parseUniverseCatalog(broken)).toThrow(/duplicate pattern ID/i);
  });

  it("marks entries planned until an exact conforming Pack exists", async () => {
    const [entry] = await catalog();
    expect(resolveUniverseCatalog([entry], [])[0].availability).toBe("planned");
    const failing = completeDeepUniverseDocument(entry.targetPack);
    failing.universe!.content.factions.pop();
    expect(resolveUniverseCatalog([entry], [failing])[0].availability).toBe("planned");
    const wrongVersion = completeDeepUniverseDocument({ ...entry.targetPack, version: "99.0.0" });
    expect(resolveUniverseCatalog([entry], [wrongVersion])[0].availability).toBe("planned");
    const ready = resolveUniverseCatalog([entry], [matchingDocument(entry)])[0];
    expect(ready).toMatchObject({ availability: "ready", playToday: { patternId: entry.patterns[0]!.id, campaignKitId: "kit.1" }, assessment: { passed: true } });
  });

  it("requires the profile identity and patterns to match the catalog entry", async () => {
    const [entry] = await catalog();
    const wrongIdentity = matchingDocument(entry);
    wrongIdentity.universe!.id = "another-universe";
    expect(resolveUniverseCatalog([entry], [wrongIdentity])[0].availability).toBe("planned");
    const wrongPatterns = matchingDocument(entry);
    wrongPatterns.universe!.patterns[0].id = "not-in-catalog";
    expect(resolveUniverseCatalog([entry], [wrongPatterns])[0].availability).toBe("planned");
  });
});
