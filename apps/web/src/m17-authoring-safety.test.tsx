import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { QuickGameBuilder, quickStartMatchesPack } from "./quick-game-builder.js";
import { parsePackSource } from "./pack-creator.js";

describe("M17 authoring safety", () => {
  it("blocks Play Today progression while another exact Pack is active", () => {
    const handoff = { universeId: "classic-fantasy", universeName: "Classic Fantasy", basePack: { id: "masterhost.classic-fantasy", version: "2.0.0" }, patternId: "border-kingdoms", campaignKitId: "kit.1", visualThemeId: "visualThemes.1" };
    expect(quickStartMatchesPack(handoff, { manifest: { id: "masterhost.space-opera", version: "1.0.0" }, questions: [] })).toBe(false);
    const storage = { value: JSON.stringify(handoff), getItem(){ return this.value; }, setItem(){}, removeItem(){ this.value = ""; } };
    Object.defineProperty(globalThis, "sessionStorage", { value: storage, configurable: true });
    const html = renderToStaticMarkup(<QuickGameBuilder request={async()=>[]} requestMedia={async()=>new Blob()} pack={{ manifest: { id: "masterhost.space-opera", version: "1.0.0" }, questions: [] }} onWorld={()=>undefined} onBack={()=>undefined} onAdvanced={()=>undefined}/>);
    expect(html).toContain("Activate the exact universe Pack");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>NEXT<\/button>/);
  });

  it("parses editable JSON source and rejects non-object input", () => {
    expect(parsePackSource('{"universe":{"id":"classic-fantasy"}}')).toMatchObject({ universe: { id: "classic-fantasy" } });
    expect(() => parsePackSource("[]")).toThrow(/JSON object/);
    expect(() => parsePackSource("{")) .toThrow();
  });
});
