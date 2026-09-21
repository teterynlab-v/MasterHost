import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { completeDeepUniverseDocument } from "../../../packages/worldpack-sdk/src/deep-universe.fixtures.js";
import { loadUniverseCatalog, validateWorldPackDocument, type WorldPackProject } from "@masterhost/worldpack-sdk";
import { registerUniverseCatalog } from "./universe-catalog.js";

const project = (id: string, realmId: string, status: "draft" | "published", document: any): WorldPackProject => ({ id, realmId, status, revision: 1, document, assetData: {}, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() });

describe("M17 universe catalog API", () => {
  it("exposes catalog and Realm-isolated deep assessment with truthful readiness", async () => {
    const entries = await loadUniverseCatalog();
    const incomplete = completeDeepUniverseDocument(entries[0].targetPack);
    incomplete.universe!.content.factions.pop();
    const projects = [project("draft-a", "realm-a", "draft", incomplete), project("draft-b", "realm-b", "draft", completeDeepUniverseDocument(entries[1].targetPack))];
    const app = Fastify();
    (app as any).masterhostResolveRealm = async (request: any) => ({ id: String(request.headers["x-realm"] ?? "realm-a"), slug: "test" });
    await registerUniverseCatalog(app, { catalog: entries, packs: { list: async realmId => projects.filter(value => value.realmId === realmId), get: async id => projects.find(value => value.id === id) ?? null }, bundledDocuments: [] });

    const planned = await app.inject({ method: "GET", url: "/api/universes", headers: { "x-realm": "realm-a" } });
    expect(planned.statusCode).toBe(200);
    expect(planned.json()).toHaveLength(12);
    expect(planned.json()[0].availability).toBe("planned");
    expect((await app.inject({ method: "GET", url: "/api/universes/classic-fantasy", headers: { "x-realm": "realm-a" } })).json()).toMatchObject({ id: "classic-fantasy", patterns: expect.arrayContaining([expect.objectContaining({ name: "Border Kingdoms" })]) });
    expect((await app.inject({ method: "GET", url: "/api/universes/unknown", headers: { "x-realm": "realm-a" } })).statusCode).toBe(404);

    const assessment = await app.inject({ method: "GET", url: "/api/pack-projects/draft-a/deep-universe", headers: { "x-realm": "realm-a" } });
    expect(assessment.json()).toMatchObject({ passed: false, diagnostics: expect.arrayContaining([expect.objectContaining({ code: "deep-universe.minimum" })]) });
    expect((await app.inject({ method: "GET", url: "/api/pack-projects/draft-b/deep-universe", headers: { "x-realm": "realm-a" } })).statusCode).toBe(404);
    expect(validateWorldPackDocument(incomplete).valid).toBe(false);

    projects.push(project("published-a", "realm-a", "published", completeDeepUniverseDocument(entries[0].targetPack)));
    const ready = await app.inject({ method: "GET", url: "/api/universes/classic-fantasy", headers: { "x-realm": "realm-a" } });
    expect(ready.json()).toMatchObject({ availability: "ready", assessment: { passed: true }, playToday: { patternId: "pattern.1" } });
    await app.close();
  });
});
