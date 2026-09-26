import { describe, it, expect } from 'vitest';
import { characterSheetValues } from '../apps/web/src/game.js';
describe('Pack-defined player sheet',()=>{
 it('shows declared labels and selected choice names in schema order',()=>{
  const schema={steps:[{fields:[{id:'name',label:'Name',type:'text'},{id:'role',label:'Crew role',type:'choice',options:[{value:'archetypes.6',label:'Memory Archivist'}]},{id:'path',label:'Progression path',type:'choice',options:[{value:'paths.3',label:'Gate Custodian'}]},{id:'portrait',label:'Portrait',type:'asset'}]}]};
  expect(characterSheetValues(schema,{path:'paths.3',name:'Len',role:'archetypes.6',portrait:'standard'})).toEqual([{id:'role',label:'Crew role',value:'Memory Archivist'},{id:'path',label:'Progression path',value:'Gate Custodian'}]);
 });
});
