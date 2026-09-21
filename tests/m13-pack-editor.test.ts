import { describe, expect, it } from "vitest";
import { createStarterPack } from "@masterhost/worldpack-sdk";
import { formatPairs, inboundPackReferences, parsePairs, removePackEntry } from "../apps/web/src/pack-editor-model.js";

describe("M13 full custom editor model", () => {
  it("names inbound references and blocks unsafe removal", () => {
    const document = createStarterPack({ realmId: "r", id: "demo", name: "Demo" }).document;
    expect(inboundPackReferences(document, "templates", "place.standard")).toEqual(["content.templates.world.root.components.places.template"]);
    expect(() => removePackEntry(document, "templates", "place.standard")).toThrow(/world\.root\.components\.places\.template/);
    expect(() => removePackEntry(document, "resources", "health")).toThrow(/actorTemplates\.guide\.resources\.health/);
  });

  it("removes an unreferenced entry without mutating the draft and parses visual maps", () => {
    const document = createStarterPack({ realmId: "r", id: "demo", name: "Demo" }).document;
    document.content.items!.spare = { label: "Spare", stackLimit: 2 };
    const next = removePackEntry(document, "items", "spare");
    expect(next.content.items!.spare).toBeUndefined();
    expect(document.content.items!.spare).toBeDefined();
    expect(parsePairs("portrait: hero.png, token:hero-token.png")).toEqual({ portrait: "hero.png", token: "hero-token.png" });
    expect(formatPairs({ portrait: "hero.png" })).toBe("portrait:hero.png");
  });
});
