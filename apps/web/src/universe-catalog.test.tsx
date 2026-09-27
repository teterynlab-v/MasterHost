import React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "./i18n/react.js";
import { UniverseCatalog, filterUniverseCatalog, readQuickStartHandoff, writeQuickStartHandoff, type UniverseCatalogItem } from "./universe-catalog.js";

const entries = JSON.parse(readFileSync("universe-catalog/catalog.json", "utf8")) as UniverseCatalogItem[];
const items = entries.map((entry, index) => index === 0 ? { ...entry, availability: "ready" as const, playToday: { patternId: "border-kingdoms", campaignKitId: "kit.border-watch", visualThemeId: "theme.illustrated" } } : { ...entry, availability: "planned" as const });

describe("M17 universe catalog experience", () => {
  it("renders all universes and a useful preview without creating a World", () => {
    Object.defineProperty(globalThis, "location", { value: { search: "" }, configurable: true });
    Object.defineProperty(globalThis, "localStorage", { value: { getItem: () => null, setItem: () => undefined }, configurable: true });
    const requests: string[] = [];
    const html = renderToStaticMarkup(<I18nProvider><UniverseCatalog request={async path => { requests.push(path); return []; }} onBack={() => undefined} onAdvanced={() => undefined} onPlay={() => undefined} initialItems={items} initialSelectedId="classic-fantasy"/></I18nProvider>);
    for (const entry of items) expect(html).toContain(entry.name.replace("&", "&amp;"));
    expect(html).toContain("travel");
    expect(html).toContain("Border Kingdoms");
    expect(html).toContain("2–6");
    expect(html).toContain("beginner");
    expect(html).toMatch(/disabled=""[^>]*>Planned|>Planned<\/button>/);
    expect(requests).toEqual([]);
  });

  it("filters generically by search, genre, tone, and complexity", () => {
    expect(filterUniverseCatalog(items, { query: "machine", genre: "", tone: "", complexity: "" }).map(item => item.id)).toEqual(["urban-fantasy", "mecha-kaiju"]);
    expect(filterUniverseCatalog(items, { query: "", genre: "horror", tone: "", complexity: "advanced" }).map(item => item.id)).toEqual(["dark-fantasy", "cosmic-investigation"]);
  });

  it("stores and consumes an exact Play Today handoff once", () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
    const handoff = { universeId: "classic-fantasy", universeName: "Classic Fantasy", basePack: { id: "masterhost.classic-fantasy", version: "2.0.0" }, patternId: "border-kingdoms", campaignKitId: "kit.border-watch", visualThemeId: "theme.illustrated" };
    writeQuickStartHandoff(storage, handoff);
    expect(readQuickStartHandoff(storage)).toEqual(handoff);
    expect(readQuickStartHandoff(storage)).toBeUndefined();
  });
});
