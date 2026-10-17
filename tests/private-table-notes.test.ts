import {describe,it,expect} from 'vitest';
import {createTableState,visibleTableState,normalizeTablePrivateNotes,mutateTablePrivateNote} from '@masterhost/game-runtime';

const legacy=()=>({...createTableState({sessionId:'s',scenes:[]}),privateNotes:['first secret','second secret']});
describe('private table notes',()=>{
 it('assigns stable IDs to legacy notes and hides both private fields from players',()=>{
  const table=legacy();normalizeTablePrivateNotes(table);
  expect(table.privateNoteEntries).toEqual([{id:'legacy-0',text:'first secret'},{id:'legacy-1',text:'second secret'}]);
  expect(visibleTableState(table,false)).not.toHaveProperty('privateNotes');
  expect(visibleTableState(table,false)).not.toHaveProperty('privateNoteEntries');
  expect(visibleTableState(table,true)).toMatchObject({privateNotes:table.privateNotes,privateNoteEntries:table.privateNoteEntries});
 });
 it('edits and deletes by ID without losing the other legacy note',()=>{
  const table=legacy();mutateTablePrivateNote(table,{kind:'edit',id:'legacy-0',text:'edited'});
  expect(table.privateNotes).toEqual(['edited','second secret']);
  mutateTablePrivateNote(table,{kind:'delete',id:'legacy-0'});
  expect(table.privateNoteEntries).toEqual([{id:'legacy-1',text:'second secret'}]);
  expect(table.privateNotes).toEqual(['second secret']);
  expect(()=>mutateTablePrivateNote(table,{kind:'delete',id:'missing'})).toThrow('note not found');
 });
 it('keeps an image on text edit and supports explicit image removal',()=>{
  const table=legacy(),image={checksum:'a',name:'photo.png',size:8,mediaType:'image/png'};
  mutateTablePrivateNote(table,{kind:'add',id:'new',text:'',image});
  mutateTablePrivateNote(table,{kind:'edit',id:'new',text:'caption'});
  expect(table.privateNoteEntries?.at(-1)?.image).toEqual(image);
  mutateTablePrivateNote(table,{kind:'edit',id:'new',text:'caption',image:null});
  expect(table.privateNoteEntries?.at(-1)?.image).toBeUndefined();
 });
});
