import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,expect,it} from 'vitest';
import {I18nProvider} from './i18n/react.js';
import {PrivateNotebook,encodeNoteImage,noteSaveRevision} from './private-notebook.js';

describe('GM private notebook',()=>{
 it('can save a draft after a scene change while protecting concurrent edits to the same note',()=>{
  const editor={id:'note-a',revision:4,originalText:'Original',originalChecksum:'old-image'};
  expect(noteSaveRevision(editor,{revision:7,privateNoteEntries:[{id:'note-a',text:'Original',image:{checksum:'old-image',name:'a.png',mediaType:'image/png',size:8}}]})).toBe(7);
  expect(()=>noteSaveRevision(editor,{revision:7,privateNoteEntries:[{id:'note-a',text:'Changed elsewhere'}]})).toThrow('NOTE_CHANGED');
  expect(()=>noteSaveRevision(editor,{revision:7,privateNoteEntries:[]})).toThrow('NOTE_CHANGED');
 });
 it('encodes a selected image without sending it and rejects unsupported or oversized files',async()=>{
  const file=new File([new Uint8Array([137,80,78,71,13,10,26,10])],'secret.png',{type:'image/png'});
  expect(await encodeNoteImage(file)).toEqual({name:'secret.png',mediaType:'image/png',data:'iVBORw0KGgo='});
  await expect(encodeNoteImage(new File(['<svg/>'],'secret.svg',{type:'image/svg+xml'}))).rejects.toThrow('NOTE_IMAGE_TYPE');
  await expect(encodeNoteImage(new File([new Uint8Array(2_000_001)],'large.png',{type:'image/png'}))).rejects.toThrow('NOTE_IMAGE_SIZE');
 });

 it('makes every legacy note manageable and exposes an accessible image picker',()=>{
  Object.defineProperty(globalThis,'location',{value:{search:'?lang=en'},configurable:true});
  Object.defineProperty(globalThis,'localStorage',{value:{getItem:()=>null},configurable:true});
  const html=renderToStaticMarkup(<I18nProvider><PrivateNotebook sessionId="session-a" token="not-rendered-token" table={{revision:4,privateNotes:['First secret','Second secret','Third secret']}} send={async()=>undefined}/></I18nProvider>);
  for(const text of ['First secret','Second secret','Third secret'])expect(html).toContain(text);
  expect((html.match(/>Edit</g)??[]).length).toBe(3);
  expect((html.match(/>Delete</g)??[]).length).toBe(3);
  expect(html).toContain('image/png,image/jpeg,image/webp');
  expect(html).not.toContain('not-rendered-token');
 });
});
