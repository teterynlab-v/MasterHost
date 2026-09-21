import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { assessDeepUniverse, loadUniverseCatalog, loadWorldPack, resolveUniverseCatalog, worldPackDocumentFromLoaded } from "@masterhost/worldpack-sdk";

describe("M18 Deep Classic Fantasy", () => {
  it("loads the installed 2.0.0 profile into a portable document and ready catalog entry", async () => {
    const pack = await loadWorldPack(resolve("worldpacks/classic-fantasy"));
    expect(pack.manifest).toMatchObject({ id: "masterhost.classic-fantasy", version: "2.0.0" });
    expect(pack.universe).toMatchObject({ id: "classic-fantasy", playToday: { patternId: "border-kingdoms" } });
    const document = await worldPackDocumentFromLoaded(pack, { terminology: { world: "World", character: "Character", gameMaster: "Game Master" }, theme: { primary: "#d9b45b", accent: "#739b68", background: "#101713" } });
    expect(assessDeepUniverse(document)).toMatchObject({ passed: true, diagnostics: [] });
    const catalog = await loadUniverseCatalog();
    expect(resolveUniverseCatalog(catalog, [document]).find(item => item.id === "classic-fantasy")).toMatchObject({ availability: "ready", playToday: { patternId: "border-kingdoms" } });
  });
});
