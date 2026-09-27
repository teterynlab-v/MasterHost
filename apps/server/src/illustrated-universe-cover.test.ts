import Fastify from 'fastify';
import {describe,it,expect} from 'vitest';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {loadGameAssetRegistry} from '@masterhost/descriptor';
import {loadUniverseCatalog,loadWorldPack,worldPackDocumentFromLoaded} from '@masterhost/worldpack-sdk';
import {registerUniverseCatalog} from './universe-catalog.js';
describe('published illustrated universe covers',()=>{
 it('serves the declared cover from the newest coherent collection without exposing arbitrary media through the cover route',async()=>{
  const assets=await loadGameAssetRegistry(resolve('game-assets/library'));
  const pack=await loadWorldPack(resolve('worldpacks/classic-fantasy'));
  const document=await worldPackDocumentFromLoaded(pack,{terminology:{world:'World',character:'Character',gameMaster:'Game Master'},theme:{primary:'#6dd6a8',accent:'#7aa7dd',background:'#10151b'}});
  const app=Fastify();(app as any).masterhostResolveRealm=async()=>({id:'cover-test'});
  await registerUniverseCatalog(app,{catalog:await loadUniverseCatalog(),packs:{list:async()=>[],get:async()=>null},bundledDocuments:[document],assets});
  const response=await app.inject('/api/universes/classic-fantasy');
  const cover=response.json().cover;expect(cover).toMatchObject({assetVersion:'1.4.0'});
  const image=await app.inject(`/api/universes/classic-fantasy/cover/${cover.checksum}`);
  expect(image.statusCode).toBe(200);expect(image.headers['content-type']).toBe('image/webp');expect(image.headers['cache-control']).toContain('immutable');
  expect(createHash('sha256').update(image.rawPayload).digest('hex')).toBe(cover.checksum);
  const npc=assets.find(asset=>asset.type==='visuals'&&asset.version==='1.4.0')!.media.find(image=>image.role==='portrait')!;
  expect((await app.inject(`/api/universes/classic-fantasy/cover/${npc.checksum}`)).statusCode).toBe(404);
  expect((await app.inject(`/api/universes/unknown/cover/${cover.checksum}`)).statusCode).toBe(404);
  expect((await app.inject('/api/universes/space-opera')).json().cover).toBeUndefined();
  await app.close();
 // Real media integrity loading competes with other complete-library fixtures in the full suite.
 },30000);
});
