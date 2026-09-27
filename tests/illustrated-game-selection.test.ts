import {describe,it,expect} from 'vitest';
import {playTodayAssets} from '../apps/web/src/quick-game-builder.js';
const categories=['setting','world-template','locations','cast','items','rules','characters','adventure','visuals'];
const bundle=(highlight:string)=>categories.map(type=>({id:type,version:'1.0.0',type,preview:{highlights:[highlight]},dependencies:[] as {id:string;version:string}[],compatibility:{basePackIds:['demo']},fragment:{provides:[type],requires:[] as string[]}}));
describe('illustrated Play Today bundle',()=>{
 it('selects the complete illustrated collection without duplicate old categories',()=>{const old=bundle('Deep Universe Standard v1'),illustrated=bundle('Illustrated Universe v1');expect(playTodayAssets([...old,...illustrated])).toEqual(illustrated)});
 it('keeps a coherent retained collection while an illustrated collection is incomplete',()=>{const old=bundle('Deep Universe Standard v1');expect(playTodayAssets([...old,...bundle('Illustrated Universe v1').slice(0,8)])).toEqual(old)});
});
it('chooses the newest complete illustrated version and retains an older complete one during assembly',()=>{
 const old=bundle('Illustrated Universe v1').map(a=>({...a,version:'1.2.0'}));
 const current=bundle('Illustrated Universe v1').map(a=>({...a,version:'1.3.0'}));
 expect(playTodayAssets([...old,...current])).toEqual(current);
 expect(playTodayAssets([...old,...current.slice(0,8)])).toEqual(old);
});

it('retains the older bundle when a complete newer bundle requires an older dependency',()=>{
 const old=bundle('Illustrated Universe v1').map(a=>({...a,version:'1.3.0'}));
 const current=bundle('Illustrated Universe v1').map(a=>({...a,version:'1.4.0'}));
 current.find(a=>a.type==='locations')!.dependencies=[{id:'world-template',version:'1.3.0'}];
 expect(playTodayAssets([...old,...current],'demo')).toEqual(old);
});
it('retains the older bundle when the newest bundle lacks a capability or is incompatible',()=>{
 const old=bundle('Illustrated Universe v1').map(a=>({...a,version:'1.3.0'}));
 const current=bundle('Illustrated Universe v1').map(a=>({...a,version:'1.4.0'}));
 current[0]!.fragment.requires=['missing'];
 expect(playTodayAssets([...old,...current],'demo')).toEqual(old);
 current[0]!.fragment.requires=[];
 current[0]!.compatibility.basePackIds=['other'];
 expect(playTodayAssets([...old,...current],'demo')).toEqual(old);
});
