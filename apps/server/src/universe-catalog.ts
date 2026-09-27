import type { FastifyInstance } from "fastify";
import {readFile} from 'node:fs/promises';
import type {GameAsset} from '@masterhost/descriptor';
import {universeCovers} from './universe-covers.js';
import { assessDeepUniverse, resolveUniverseCatalog, type UniverseCatalogEntry, type WorldPackDocument, type WorldPackProject } from "@masterhost/worldpack-sdk";

interface PackReader {
  list(realmId: string): Promise<WorldPackProject[]>;
  get(id: string): Promise<WorldPackProject | null>;
}

interface UniverseCatalogDependencies {
  catalog: UniverseCatalogEntry[];
  packs: PackReader;
  bundledDocuments: WorldPackDocument[];
  assets?: GameAsset[];
}

const fail = (message: string, statusCode: number) => Object.assign(Error(message), { statusCode });

export async function registerUniverseCatalog(app: FastifyInstance, dependencies: UniverseCatalogDependencies) {
  const realmFor = async (request: any) => app.masterhostResolveRealm ? app.masterhostResolveRealm(request) : fail("Realm hosting is unavailable", 503) as never;
  const itemsFor = async (request: any) => {
    const realm = await realmFor(request);
    const published = (await dependencies.packs.list(realm.id)).filter(project => project.status === "published").map(project => project.document);
    return resolveUniverseCatalog(dependencies.catalog, [...dependencies.bundledDocuments, ...published]).map(item=>{
      const cover=item.availability==='ready'?universeCovers(dependencies.assets??[],item.targetPack.id)[0]:undefined;
      return {...item,...(cover?{cover:{checksum:cover.media.checksum,assetVersion:cover.assetVersion,alt:item.name}}:{})};
    });
  };

  app.get("/api/universes", async (request: any) => itemsFor(request));
  app.get('/api/universes/:id/cover/:checksum',async(request:any,reply)=>{
    const item=(await itemsFor(request)).find(item=>item.id===request.params.id);
    const cover=item?.availability==='ready'?universeCovers(dependencies.assets??[],item.targetPack.id).find(cover=>cover.media.checksum===request.params.checksum):undefined;
    if(!cover)throw fail('universe cover not found',404);
    reply.header('content-type',cover.media.mediaType);reply.header('content-length',String(cover.media.size));reply.header('cache-control','public, max-age=31536000, immutable');reply.header('x-content-type-options','nosniff');
    return reply.send(await readFile(cover.media.absolutePath));
  });
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
    return assessDeepUniverse(request.body?.document ?? {});
  });
}
