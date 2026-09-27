import {randomUUID} from 'node:crypto';
import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import postgres from 'postgres';
import {PackProjectRepository} from '@masterhost/persistence';
import {loadWorldPack,worldPackDocumentFromLoaded,type WorldPackProject} from '@masterhost/worldpack-sdk';
import {resolve} from 'node:path';
const url=process.env.TEST_DATABASE_URL;
const suite=url?describe:describe.skip;
suite('published Pack lookup isolation',()=>{
 let repo:PackProjectRepository,sql:ReturnType<typeof postgres>,published:WorldPackProject,draft:WorldPackProject;
 const realm=randomUUID(),otherRealm=randomUUID();
 beforeAll(async()=>{
  repo=new PackProjectRepository(url!);sql=postgres(url!);await repo.migrate();
  const pack=await loadWorldPack(resolve('worldpacks/urban-fantasy'));
  const document=await worldPackDocumentFromLoaded(pack,{terminology:{world:'World',character:'Character',gameMaster:'Game Master'},theme:{primary:'#6dd6a8',accent:'#7aa7dd',background:'#10151b'}});
  const now=new Date().toISOString();
  published={id:randomUUID(),realmId:realm,status:'published',revision:1,document,assetData:{'test.webp':'cHJlc2VydmVk'},createdAt:now,updatedAt:now};
  draft={...published,id:randomUUID(),status:'draft',document:structuredClone(document)};draft.document.manifest.version='99.0.0';
  await repo.create(published);await repo.create(draft);
 });
 afterAll(async()=>{if(sql){await sql`delete from world_pack_projects where realm_id=${realm}`;await sql.end();}await repo?.close();});
 it('returns the exact published version with its media without losing data',async()=>{
  expect(await repo.findPublished(realm,published.document.manifest.id,published.document.manifest.version)).toEqual(published);
 });
 it('rejects other Realms, versions and unpublished drafts',async()=>{
  expect(await repo.findPublished(otherRealm,published.document.manifest.id,published.document.manifest.version)).toBeNull();
  expect(await repo.findPublished(realm,published.document.manifest.id,'missing')).toBeNull();
  expect(await repo.findPublished(realm,draft.document.manifest.id,draft.document.manifest.version)).toBeNull();
 });
});
