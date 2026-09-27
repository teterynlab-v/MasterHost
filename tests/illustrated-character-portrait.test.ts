import {describe,it,expect} from 'vitest';
import {characterPortraitPath} from '../apps/web/src/game.js';
describe('individual character portrait',()=>{
 it('uses the Pack-defined portrait assigned to the selected archetype',()=>{expect(characterPortraitPath({portrait:'assets/classic-fantasy/illustrated/archetypes.4.webp'},'assets/default.svg')).toBe('assets/classic-fantasy/illustrated/archetypes.4.webp')});
 it('uses the session fallback when no valid character portrait exists',()=>{expect(characterPortraitPath({portrait:true},'assets/default.svg')).toBe('assets/default.svg');expect(characterPortraitPath(undefined,undefined)).toBeUndefined()});
});
