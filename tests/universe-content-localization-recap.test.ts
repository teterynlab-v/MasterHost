import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {buildCampaignRecap,redactSpectatorTimeline} from '@masterhost/game-runtime';
import {withRecapDisplay} from '../apps/server/src/recap-localization.js';
import {recapEntryText} from '../apps/web/src/i18n/recap.js';
import {createContentTranslator} from '../apps/web/src/i18n/content.js';
const event=(sequence:number,type:string,payload:any={})=>({sequence,type,payload,createdAt:'2026-09-28T00:00:00Z'});
const world:any={entities:[{id:'authored',values:{name:{value:'Port Meridian',source:'generated'}}},{id:'custom',values:{name:{value:'Port Meridian',source:'custom'}}}]};
const c=createContentTranslator('ru',{'space-opera':{ru:{'Port Meridian':'Порт Меридиан','Use Plasma Carbine':'Применить плазменный карабин'}},_ui:{ru:{'Travelled to {location}.':'Прибытие: {location}.','Check resolved: {outcome}.':'Проверка: {outcome}.','Action {action} completed.':'Действие «{action}» выполнено.','An encounter began.':'Началась сцена столкновения.','The encounter ended.':'Сцена столкновения завершилась.','Canon established: {title}.':'Установлен канон: {title}.','success':'Успех'}}},{manifest:{id:'masterhost.space-opera'}});
describe('recap display preserves canonical events and authored text',()=>{
 it('localizes generated captions and authored travel/action labels without rewriting IDs',()=>{
  const events=[event(1,'ActorMoved',{toLocationId:'authored'}),event(2,'CheckResolved',{outcome:'success'}),event(3,'ActionResolved',{actionId:'shoot'}),event(4,'EncounterStarted'),event(5,'EncounterEnded')],before=JSON.stringify(events),recap=buildCampaignRecap('c',events);
  const projected=withRecapDisplay(recap,events,world,{shoot:{label:'Use Plasma Carbine'}});
  expect(projected.entries.map(entry=>recapEntryText(entry,c))).toEqual(['Прибытие: Порт Меридиан.','Проверка: Успех.','Действие «Применить плазменный карабин» выполнено.','Началась сцена столкновения.','Сцена столкновения завершилась.']);
  expect(JSON.stringify(events)).toBe(before);expect(recap.entries[0]).not.toHaveProperty('display');expect(projected.entries[2]?.text).toBe('Action shoot completed.');
 });
 it('preserves custom World names, narrative sentences and canon titles even when they match stock copy',()=>{
  const events=[event(1,'TravelCompleted',{locationId:'custom'}),event(2,'NarrativeEventRecorded',{text:'An encounter began.'}),event(3,'CanonFactPromoted',{title:'Port Meridian'}),event(4,'TravelCompleted',{locationId:'authored',locationName:'My Station'})];
  const projected=withRecapDisplay(buildCampaignRecap('c',events),events,world,{});
  expect(projected.entries.map(entry=>recapEntryText(entry,c))).toEqual(['Прибытие: Port Meridian.','An encounter began.','Установлен канон: Port Meridian.','Прибытие: My Station.']);
 });
 it('projects only already filtered entries and adds no private event payload',()=>{
  const events=[event(1,'CheckRequested',{id:'secret',visibility:'hidden',privateNotes:'secret note'}),event(2,'CheckResolved',{requestId:'secret',outcome:'success',privateNotes:'secret outcome'}),event(3,'EncounterEnded',{privateNotes:'secret ending'})],visible=redactSpectatorTimeline(events);
  const projected=withRecapDisplay(buildCampaignRecap('c',visible),visible,world,{});
  expect(projected.entries).toHaveLength(1);expect(projected.entries[0]?.sequence).toBe(3);expect(JSON.stringify(projected)).not.toContain('secret');
 });
 it('renders every generated caption from the five shipped language dictionaries',()=>{
  const events=[event(1,'ActorMoved',{}),event(2,'CheckResolved',{}),event(3,'ActionResolved',{}),event(4,'EncounterStarted'),event(5,'EncounterEnded'),event(6,'CanonFactPromoted',{})],projected=withRecapDisplay(buildCampaignRecap('c',events),events,world,{});
  for(const locale of ['ru','es','ja','zh-CN','ko']){
   const dictionary=JSON.parse(readFileSync(`content-locales/_ui/${locale}.json`,'utf8')),translate=createContentTranslator(locale,{_ui:{[locale]:dictionary}});
   for(const entry of projected.entries){expect(recapEntryText(entry,translate)).not.toBe(entry.text);expect(recapEntryText(entry,translate)).not.toMatch(/\{\w+\}/);}
  }
 });
 it('handles missing metadata through translated generic captions and preserves older recap text',()=>{
  const events=[event(1,'ActorMoved',{}),event(2,'ActionResolved',{})];
  const cFallback=createContentTranslator('ru',{_ui:{ru:{'Travelled to {location}.':'Прибытие: {location}.','a new location':'новое место','An action completed.':'Действие выполнено.'}}});
  expect(withRecapDisplay(buildCampaignRecap('c',events),events,world,{}).entries.map(entry=>recapEntryText(entry,cFallback))).toEqual(['Прибытие: новое место.','Действие выполнено.']);
  expect(recapEntryText({text:'Older custom recap'},cFallback)).toBe('Older custom recap');
 });
});
