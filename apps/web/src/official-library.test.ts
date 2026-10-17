import {describe,expect,it} from 'vitest';
import {loadOfficialLibrary} from './official-library.js';

describe('official World illustrations',()=>{
 it('matches illustrated covers by Pack identity instead of catalog order and preserves the selected Realm',async()=>{
  Object.defineProperty(globalThis,'location',{value:{search:'?realm=sea%20realm'},configurable:true});
  const packs=[{manifest:{id:'masterhost.age-of-sail',name:'Age of Sail'}},{manifest:{id:'masterhost.classic-fantasy',name:'Classic Fantasy'}},{manifest:{id:'legacy.pack',name:'Legacy'}}];
  const universes=[
   {id:'classic-fantasy',targetPack:{id:'masterhost.classic-fantasy'},cover:{checksum:'fantasy-checksum',alt:'Classic Fantasy'}},
   {id:'age-of-sail',targetPack:{id:'masterhost.age-of-sail'},cover:{checksum:'sail-checksum',alt:'Age of Sail'}}
  ];
  const result=await loadOfficialLibrary(async path=>{
   if(path==='/official-packs')return packs;
   if(path==='/universes')return universes;
   throw Error(`Unexpected request: ${path}`);
  });
  expect(result.map(pack=>pack.cover)).toEqual([
   {url:'http://localhost:8080/api/universes/age-of-sail/cover/sail-checksum?realm=sea%20realm',alt:'Age of Sail'},
   {url:'http://localhost:8080/api/universes/classic-fantasy/cover/fantasy-checksum?realm=sea%20realm',alt:'Classic Fantasy'},
   {url:'http://localhost:8080/api/official-packs/legacy.pack/assets/ui/background.svg',alt:'Legacy'}
  ]);
 });
});
