import {describe,it,expect} from 'vitest';
import {authoredFieldSource,withSceneProvenance,withActorProvenance,withNodeProvenance,packContentMetadata} from '../apps/server/src/content-provenance.js';
describe('authored content provenance for localization',()=>{
 it('returns only locale metadata from a saved Worlds exact Pack',()=>{
 const pack:any={manifest:{id:'custom.pack',version:'1.0'},universe:{id:'private-universe',localization:{sourceLocale:'en',strings:{ru:{opening:'Начало'}}},content:{scenes:[{description:'secret future'}]},campaignKits:[{gmGuidance:['secret']}]}};
 const result=packContentMetadata(pack);expect(result).toEqual({manifest:{id:'custom.pack'},universe:{id:'private-universe',localization:pack.universe.localization}});expect(JSON.stringify(result)).not.toContain('secret');
 });
 it('preserves custom fields and does not mutate persisted scenes',()=>{
  const scene={id:'e1',title:'Warrior',summary:'Custom story',sourceEntityId:'e1',status:'active'};
  const world:any={entities:[{id:'e1',values:{name:{value:'Warrior',source:'custom'},description:{value:'Custom story',source:'custom'}}}]};
  expect(withSceneProvenance(scene,world)).toMatchObject({titleSource:'custom',summarySource:'custom'});
  expect(scene).not.toHaveProperty('titleSource');
 });
 it('distinguishes custom NPC labels and custom map nodes',()=>{
 const world:any={entities:[{id:'e1',values:{name:{value:'Warrior',source:'custom'}}}]};
 expect(withActorProvenance({kind:'npc',label:'Warrior',worldEntityId:'e1',worldEntityLabel:'Warrior'},world,{})).toMatchObject({labelSource:'custom',worldEntityNameSource:'custom'});
 expect(withActorProvenance({kind:'npc',label:'Warrior',labelSource:'custom',templateId:'t'},world,{t:{label:'Warrior'}}).labelSource).toBe('custom');
 expect(withNodeProvenance({id:'e1',label:'Warrior'},world).labelSource).toBe('custom');
 });
 it('does not treat an edited stored title as authored',()=>{
  const world:any={entities:[{id:'e1',values:{name:{value:'Original',source:'generated'}}}]};
  expect(withSceneProvenance({id:'e1',title:'My title',sourceEntityId:'e1'},world).titleSource).toBe('custom');
  expect(authoredFieldSource({value:'Original',source:'generated'},'Original')).toBe('generated');
 });
});
