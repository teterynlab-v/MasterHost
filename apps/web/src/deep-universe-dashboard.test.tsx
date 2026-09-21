import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { assessDeepUniverse } from "@masterhost/worldpack-sdk";
import { completeDeepUniverseDocument } from "../../../packages/worldpack-sdk/src/deep-universe.fixtures.js";
import { DeepUniverseDashboard, deepUniverseGraphSummary, filterDeepUniverseContent, localeCoverage } from "./deep-universe-dashboard.js";

describe("M17 Pack Creator deep universe dashboard", () => {
  it("shows count progress, blocking paths, graph and locale coverage", () => {
    const document = completeDeepUniverseDocument({ id: "masterhost.dashboard", version: "1.0.0" });
    document.universe!.content.factions.pop();
    delete document.universe!.localization.strings.ru["content.npcs.1"];
    const assessment = assessDeepUniverse(document);
    const html = renderToStaticMarkup(<DeepUniverseDashboard document={document} assessment={assessment} draft canPublish={false}/>);
    expect(html).toContain("7 / 8");
    expect(html).toContain("universe.content.factions");
    expect(html).not.toContain("href=\"#deep-");
    expect(html).toContain("Preview and publication blocked");
    expect(html).toContain("Draft editing remains available");
    expect(html).toContain("ru");
    expect(deepUniverseGraphSummary(document.universe!)).toMatchObject({ nodes: expect.any(Number), relations: expect.any(Number), disconnectedCore: 0 });
    expect(localeCoverage(document.universe!).find(item => item.locale === "ru")?.missing).toBe(1);
  });

  it("filters content by pattern and kind and previews exact Campaign Kit data", () => {
    const document = completeDeepUniverseDocument({ id: "masterhost.dashboard", version: "1.0.0" });
    expect(filterDeepUniverseContent(document.universe!, "pattern.2", "npcs").every(entry => entry.patternIds.includes("pattern.2"))).toBe(true);
    const html = renderToStaticMarkup(<DeepUniverseDashboard document={document} assessment={assessDeepUniverse(document)} draft canPublish initialPattern="pattern.1" initialKind="scenes" initialKitId="kit.1"/>);
    expect(html).toContain("Campaign Kit 1");
    expect(html).toContain("180–240 minutes");
    expect(html).toContain("2–5 players");
    expect(html).toContain("scenes.1");
    expect(html).toContain("npcs.1");
    expect(html).toContain("locations.1");
    expect(html).toContain("items.1");
    expect(html).toContain("Frame the opening conflict clearly.");
  });

  it("describes the profile as optional for legacy Packs", () => {
    const html = renderToStaticMarkup(<DeepUniverseDashboard document={{}} draft canPublish={false}/>);
    expect(html).toContain("optional Deep Universe standard");
    expect(html).toContain("published normally");
  });
});
