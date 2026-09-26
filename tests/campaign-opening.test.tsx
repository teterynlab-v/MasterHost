import { describe,it,expect } from 'vitest';
import { gameOverview } from '../apps/web/src/game-hub.js';
import { campaignScenes } from '../apps/server/src/campaign-scenes.js';
const entity=(id:string,kind:string,name:string,extra:Record<string,unknown>={})=>({id,kind,values:Object.fromEntries(Object.entries({name,...extra}).map(([key,value])=>[key,{value}]))});
const entities=[entity('old','event','Unrelated legacy hook'),entity('loc','location','Dock'),entity('later','scene','Second scene',{deepId:'scenes.4'}),entity('opening','scene','Signal in the Wreckage',{deepId:'scenes.1'}),entity('kit','campaign-kit','Broken Relay',{openingSceneId:'scenes.1'})];
describe('Campaign Kit opening',()=>{
 it('shows the exact selected opening instead of the first generic event',()=>expect(gameOverview({id:'w',name:'Sector',entities}).opening).toBe('Signal in the Wreckage'));
 it('falls back to a real scene when there is no Kit',()=>expect(gameOverview({id:'w',name:'Sector',entities:entities.filter(e=>e.kind!=='campaign-kit')}).opening).toBe('Second scene'));
 it('orders the selected opening first and keeps location-only Worlds usable',()=>{expect(campaignScenes(entities,new Set(['location'])).map(e=>e.id)).toEqual(['opening','later']);expect(campaignScenes(entities.filter(e=>e.kind==='location'),new Set(['location'])).map(e=>e.id)).toEqual(['loc'])});
});
