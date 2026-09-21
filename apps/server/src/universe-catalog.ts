import type { FastifyInstance } from "fastify";
import { assessDeepUniverse, resolveUniverseCatalog, WorldPackDocumentSchema, type UniverseCatalogEntry, type WorldPackDocument, type WorldPackProject } from "@masterhost/worldpack-sdk";

interface PackReader {
  list(realmId: string): Promise<WorldPackProject[]>;
  get(id: string): Promise<WorldPackProject | null>;
}

interface UniverseCatalogDependencies {
  catalog: UniverseCatalogEntry[];
  packs: PackReader;
  bundledDocuments: WorldPackDocument[];
}

const fail = (message: string, statusCode: number) => Object.assign(Error(message), { statusCode });

export async function registerUniverseCatalog(app: FastifyInstance, dependencies: UniverseCatalogDependencies) {
  const realmFor = async (request: any) => app.masterhostResolveRealm ? app.masterhostResolveRealm(request) : fail("Realm hosting is unavailable", 503) as never;
  const itemsFor = async (request: any) => {
    const realm = await realmFor(request);
    const published = (await dependencies.packs.list(realm.id)).filter(project => project.status === "published").map(project => project.document);
    return resolveUniverseCatalog(dependencies.catalog, [...dependencies.bundledDocuments, ...published]);
  };

  app.get("/api/universes", async (request: any) => itemsFor(request));
  app.get("/api/universes/:id", async (request: any) => {
    const item = (await itemsFor(request)).find(candidate => candidate.id === request.params.id);
    if (!item) throw fail("universe catalog entry not found", 404);
    return item;
  });
  app.get("/api/pack-projects/:id/deep-universe", async (request: any) => {
    const realm = await realmFor(request), project = await dependencies.packs.get(request.params.id);
    if (!project || project.realmId !== realm.id) throw fail("Pack project not found", 404);
    return assessDeepUniverse(project.document);
  });
  app.post("/api/pack-projects/:id/deep-universe", async (request: any) => {
    const realm = await realmFor(request), project = await dependencies.packs.get(request.params.id);
    if (!project || project.realmId !== realm.id) throw fail("Pack project not found", 404);
    return assessDeepUniverse(WorldPackDocumentSchema.parse(request.body?.document));
  });
}
