import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { initialQuickDecisions, QuickGameBuilder, quickBuilderFlow, quickStartMatchesPack } from "./quick-game-builder.js";
import { parsePackSource } from "./pack-creator.js";

describe("M17 authoring safety", () => {
  it("blocks Play Today progression while another exact Pack is active", () => {
    const handoff = { universeId: "classic-fantasy", universeName: "Classic Fantasy", basePack: { id: "masterhost.classic-fantasy", version: "2.0.0" }, patternId: "border-kingdoms", campaignKitId: "kit.1", visualThemeId: "visualThemes.1" };
    expect(quickStartMatchesPack(handoff, { manifest: { id: "masterhost.space-opera", version: "1.0.0" }, questions: [] })).toBe(false);
    const storage = { value: JSON.stringify(handoff), getItem(){ return this.value; }, setItem(){}, removeItem(){ this.value = ""; } };
    Object.defineProperty(globalThis, "sessionStorage", { value: storage, configurable: true });
    const html = renderToStaticMarkup(<QuickGameBuilder request={async()=>[]} requestMedia={async()=>new Blob()} pack={{ manifest: { id: "masterhost.space-opera", version: "1.0.0" }, questions: [] }} onWorld={()=>undefined} onBack={()=>undefined} onAdvanced={()=>undefined}/>);
    expect(html).toContain("This universe is temporarily unavailable");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Continue<\/button>/);
  });

  it("turns the selected Play Today pattern, kit and theme into Pack decisions", () => {
    const handoff = { universeId: "classic-fantasy", universeName: "Classic Fantasy", basePack: { id: "masterhost.classic-fantasy", version: "2.0.0" }, patternId: "war-of-heirs", campaignKitId: "kit.war-of-heirs", visualThemeId: "visualThemes.2" };
    const options = (values: string[]) => values.map(value => ({ value, label: value }));
    expect(initialQuickDecisions([
      { id: "world.pattern", label: "Pattern", default: "border-kingdoms", options: options(["border-kingdoms", "war-of-heirs"]) },
      { id: "world.campaignKit", label: "Kit", default: "kit.border-kingdoms", options: options(["kit.border-kingdoms", "kit.war-of-heirs"]) },
      { id: "world.visualTheme", label: "Theme", default: "visualThemes.1", options: options(["visualThemes.1", "visualThemes.2"]) },
      { id: "world.threat", label: "Threat", default: "medium", options: options(["medium", "high"]) },
    ], handoff)).toEqual({ "world.pattern": "war-of-heirs", "world.campaignKit": "kit.war-of-heirs", "world.visualTheme": "visualThemes.2", "world.threat": "medium" });
  });

  it("skips asset categories that contain no real choice", () => {
    const assets = [
      { id: "setting.only", version: "1.0.0", type: "setting", fragment: { parameters: {} } },
      ...["world-template","locations","cast","items","characters","adventure","visuals"].map(type => ({ id: `${type}.only`, version: "1.0.0", type, fragment: { parameters: {} } })),
      { id: "rules.a", version: "1.0.0", type: "rules", fragment: { parameters: {} } },
      { id: "rules.b", version: "1.0.0", type: "rules", fragment: { parameters: {} } },
    ] as any;
    expect(quickBuilderFlow(assets).map(step => step.kind === "category" ? step.type : step.kind)).toEqual(["name", "rules", "decisions", "review"]);
  });

  it("parses editable JSON source and rejects non-object input", () => {
    expect(parsePackSource('{"universe":{"id":"classic-fantasy"}}')).toMatchObject({ universe: { id: "classic-fantasy" } });
    expect(() => parsePackSource("[]")).toThrow(/JSON object/);
    expect(() => parsePackSource("{")) .toThrow();
  });
});
