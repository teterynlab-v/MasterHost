import {existsSync,readFileSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {describe,it,expect} from 'vitest';
import {loadWorldPack,worldPackDocumentFromLoaded,toLoadedWorldPack,buildCharacterState} from '@masterhost/worldpack-sdk';
import {loadGameAssetRegistry,reviewQuickGameSelection,composeGameDescriptor,gameAssetFragments,gameAssetMedia,buildDescriptor} from '@masterhost/descriptor';
import {compileSatisfying} from '@masterhost/world-compiler';
import {exportMhPack,importMhPack} from '@masterhost/persistence';
const catalog=JSON.parse(readFileSync('universe-catalog/catalog.json','utf8')) as {id:string;targetPack:{id:string;version:string}}[];
describe('individual illustrated universe asset collections',()=>{
 for(const entry of catalog)it.runIf(existsSync(`artwork/${entry.id}-integration.json`))(`${entry.id}: distinct images, all Kits and portable Pack media`,async()=>{
  const assets=await loadGameAssetRegistry(resolve('game-assets/library'));
  const integration=JSON.parse(readFileSync(`artwork/${entry.id}-integration.json`,'utf8'));
  const selected=assets.filter(a=>a.version===integration.version&&a.compatibility.basePackIds.includes(entry.targetPack.id)&&a.preview.highlights.includes('Illustrated Universe v1'));
  expect(selected).toHaveLength(9);
  const visual=selected.find(a=>a.type==='visuals')!;
  expect(visual.media).toHaveLength(151);expect(new Set(visual.media.map(m=>m.checksum)).size).toBe(151);
  const review=reviewQuickGameSelection(assets,entry.targetPack.id,selected.map(a=>({id:a.id,version:a.version})));
  expect(review).toMatchObject({ready:true,diagnostics:[]});
  const pack=await loadWorldPack(resolve('worldpacks',entry.id));
  const base=await worldPackDocumentFromLoaded(pack,{terminology:{world:'World',character:'Character',gameMaster:'Game Master'},theme:{primary:'#6dd6a8',accent:'#7aa7dd',background:'#10151b'}});
  const composed=composeGameDescriptor({projectId:`illustrated-${entry.id}`,revision:1,name:`Illustrated ${entry.id}`,base,fragments:gameAssetFragments(assets),selections:review.orderedSelections.map(a=>({fragmentId:a.id,version:a.version,parameters:{}}))});
  expect(composed.report.valid,JSON.stringify(composed.report.diagnostics)).toBe(true);
  const art=composed.document.artSets[composed.document.manifest.defaultArtSet]!;
  expect(Object.keys(art.families??{})).toHaveLength(151);
  const schema=composed.document.content.characterCreation!;
  const defaults=Object.fromEntries(schema.steps.flatMap(step=>step.fields).map(field=>[field.id,field.default??(field.type==='text'?'Art Tester':field.type==='number'?1:field.options?.[0]?.value)]));
  const portrait=schema.steps.flatMap(step=>step.fields).find(field=>field.id==='portrait')!;
  const illustratedPortraits=portrait.options!.filter(option=>String(option.value).startsWith('archetypes.'));
  expect(illustratedPortraits).toHaveLength(8);
  expect(buildCharacterState(schema,defaults).assets.portrait).toBe(`assets/${entry.id}/illustrated-${integration.version}/archetypes.1.webp`);
  expect(schema.steps.some(step=>step.id==='illustrated-portrait')).toBe(false);
  for(const option of illustratedPortraits)expect(buildCharacterState(schema,{...defaults,portrait:option.value}).assets.portrait).toBe(`assets/${entry.id}/illustrated-${integration.version}/${option.value}.webp`);
  for(const [kitIndex,kit] of pack.universe!.campaignKits.entries()){
   const descriptor=buildDescriptor({packId:composed.document.manifest.id,packVersion:composed.document.manifest.version,choices:[{path:'world.pattern',value:{mode:'explicit',value:kit.patternIds[0]}},{path:'world.campaignKit',value:{mode:'explicit',value:kit.id}},{path:'world.visualTheme',value:{mode:'explicit',value:`visualThemes.${kitIndex+1}`}}]});
   const compiled=compileSatisfying({realmId:randomUUID(),pack:toLoadedWorldPack(composed.document),descriptor,seed:kit.id});
   expect(compiled.constraints.every(c=>c.passed)).toBe(true);
   expect(compiled.world.entities.filter(e=>e.kind==='scene')).toHaveLength(6);
   for(const entity of compiled.world.entities.filter(e=>e.values.deepId))expect(entity.tags.some(tag=>Boolean(art.families?.[tag]))).toBe(true);
  }
  const assetData:Record<string,string>={};
  for(const [name,meta]of Object.entries(composed.document.assets)){const media=gameAssetMedia(assets,name,meta.checksum);assetData[name]=(await readFile(media?.absolutePath??join(pack.root,'assets',name))).toString('base64');}
  const now=new Date().toISOString();const project={id:randomUUID(),realmId:randomUUID(),status:'published' as const,revision:1,document:composed.document,assetData,createdAt:now,updatedAt:now};
  const archive=exportMhPack(project);expect(archive.length).toBeLessThan(10000000);
  const imported=importMhPack(archive,randomUUID());expect(imported.document).toEqual(project.document);expect(imported.assetData).toEqual(assetData);
 },30000);
});
