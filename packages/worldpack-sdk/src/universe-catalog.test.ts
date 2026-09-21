import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { completeDeepUniverseDocument } from "./deep-universe.fixtures.js";
import { parseUniverseCatalog, resolveUniverseCatalog } from "./universe-catalog.js";

async function catalog() {
  return parseUniverseCatalog(JSON.parse(await readFile(resolve(process.cwd(), "universe-catalog/catalog.json"), "utf8")));
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
    const ready = resolveUniverseCatalog([entry], [completeDeepUniverseDocument(entry.targetPack)])[0];
    expect(ready).toMatchObject({ availability: "ready", playToday: { patternId: "pattern.1", campaignKitId: "kit.1" }, assessment: { passed: true } });
  });
});
