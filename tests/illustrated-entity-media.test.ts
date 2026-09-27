import {describe,it,expect} from 'vitest';
import {entityPackMedia,entityAvatarMedia} from '../apps/server/src/entity-media.js';
describe('individual Pack entity art',()=>{
 it('uses an adversary token before an unrelated default portrait',()=>{expect(entityAvatarMedia({kind:'npc',tags:['threat.1']},{id:'test',name:'Test',defaults:{portrait:'assets/default.webp'},families:{'threat.1':{token:'assets/threat.1.webp'}}})).toBe('assets/threat.1.webp')});
 it('resolves a named NPC portrait from its family instead of the generic portrait',()=>{expect(entityPackMedia({kind:'npc',tags:['illustrated.npcs.2']},{id:'test',name:'Test',defaults:{portrait:'assets/default.svg'},families:{'illustrated.npcs.2':{portrait:'assets/npcs.2.webp'}}}).portrait).toBe('assets/npcs.2.webp')});
 it('preserves type art precedence and fallback for retained Packs',()=>{expect(entityPackMedia({kind:'npc',tags:[]},{id:'test',name:'Test',defaults:{portrait:'assets/default.svg'},types:{npc:{portrait:'assets/type.svg'}}}).portrait).toBe('assets/type.svg');expect(entityPackMedia({kind:'npc',tags:[]},{id:'test',name:'Test',defaults:{portrait:'assets/default.svg'}}).portrait).toBe('assets/default.svg')});
});
