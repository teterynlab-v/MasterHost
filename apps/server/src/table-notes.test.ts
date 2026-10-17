import {describe,it,expect} from 'vitest';
import Fastify from 'fastify';
import {createTableState,visibleTableState} from '@masterhost/game-runtime';
import {registerTableNotes} from './table-notes.js';
const image={name:'секрет image.png',mediaType:'image/png',data:Buffer.from([137,80,78,71,13,10,26,10]).toString('base64')};
const setup=async(role='gm',state='live')=>{
 const app=Fastify();let table={...createTableState({sessionId:'s',scenes:[]}),privateNotes:['existing']};
 const notifications:unknown[]=[],uploads:any[]=[];
 await registerTableNotes(app,{
  authorize:async(req,id)=>{if(role!=='gm'||id!=='s')throw Object.assign(Error('GM required'),{statusCode:403})},
  session:async()=>({state}),
  update:async(_id,revision,mutate,_event,upload)=>{if(revision!==table.revision)throw Object.assign(Error('stale'),{statusCode:409});const next=structuredClone(table);mutate(next);next.revision++;table=next;if(upload)uploads.push(upload);return next},
  image:async()=>({data:Buffer.from([137,80,78,71,13,10,26,10]),mediaType:'image/png'}),
  notify:async(_id,next)=>{notifications.push(visibleTableState(next,false))},
 });return {app,notifications,uploads};
};
describe('GM private note routes',()=>{
 it('adds an image-only note and edits/deletes a legacy note without leaking broadcast data',async()=>{
  const {app,notifications,uploads}=await setup();
  const created=await app.inject({method:'POST',url:'/api/sessions/s/table/notes',payload:{expectedRevision:1,text:'',image}});
  expect(created.statusCode).toBe(200);expect(created.json().privateNoteEntries[1].image).toMatchObject({name:image.name,size:8});
  expect(uploads[0].data).toEqual(Buffer.from(image.data,'base64'));
  const edited=await app.inject({method:'PATCH',url:'/api/sessions/s/table/notes/legacy-0',payload:{expectedRevision:2,text:'edited'}});
  expect(edited.statusCode).toBe(200);expect(edited.json().privateNotes).toEqual(['edited','']);
  const deleted=await app.inject({method:'DELETE',url:'/api/sessions/s/table/notes/legacy-0',payload:{expectedRevision:3}});
  expect(deleted.statusCode).toBe(200);expect(deleted.json().privateNoteEntries).toHaveLength(1);
  expect(JSON.stringify(notifications)).not.toMatch(/privateNote|existing|edited|секрет/);await app.close();
 });
 it('protects image bytes and all mutations from players, spectators and another session',async()=>{
  for(const role of ['player','spectator','gm']){const {app}=await setup(role);const id=role==='gm'?'other':'s';
   expect((await app.inject(`/api/sessions/${id}/table/notes/legacy-0/image`)).statusCode).toBe(403);
   for(const method of ['POST','PATCH','DELETE'] as const)expect((await app.inject({method,url:`/api/sessions/${id}/table/notes${method==='POST'?'':'/legacy-0'}`,payload:{expectedRevision:1,text:'x'}})).statusCode).toBe(403);
   await app.close();}
 });
 it('serves image privately without filename or caching',async()=>{const {app}=await setup();const res=await app.inject('/api/sessions/s/table/notes/n/image');expect(res.statusCode).toBe(200);expect(res.headers['cache-control']).toBe('private, no-store');expect(res.headers['x-content-type-options']).toBe('nosniff');expect(res.headers['content-type']).toBe('image/png');expect(res.rawPayload).toEqual(Buffer.from(image.data,'base64'));await app.close()});
 it('rejects stale revisions and immutable sessions',async()=>{
  const {app,notifications}=await setup();expect((await app.inject({method:'POST',url:'/api/sessions/s/table/notes',payload:{expectedRevision:2,text:'x',image}})).statusCode).toBe(409);expect(notifications).toEqual([]);await app.close();
  const closed=await setup('gm','finished');expect((await closed.app.inject({method:'DELETE',url:'/api/sessions/s/table/notes/n',payload:{expectedRevision:1}})).statusCode).toBe(409);await closed.app.close();
 });
 it('validates image signatures, limits, filenames, base64 and nonempty notes',async()=>{
  const {app,uploads}=await setup();
  for(const payload of [{text:''},{text:'x',expectedRevision:0},{text:'x',image:{...image,data:'!!!!'}},{text:'x',image:{...image,mediaType:'image/jpeg'}},{text:'x',image:{...image,name:'a'.repeat(181)}},{text:'x',image:{...image,data:Buffer.alloc(2_000_001).toString('base64')}}]){
   const res=await app.inject({method:'POST',url:'/api/sessions/s/table/notes',payload:{expectedRevision:1,...payload}});expect(res.statusCode).toBe(400);
  }expect(uploads).toEqual([]);await app.close();
 });
 it('accepts JPEG and WebP images and returns missing-note errors without notification',async()=>{
  const {app,notifications}=await setup();
  for(const [index,mediaType,data] of [[1,'image/jpeg',Buffer.from([255,216,255,217])],[2,'image/webp',Buffer.from('RIFF0000WEBP')]] as const){
   const result=await app.inject({method:'POST',url:'/api/sessions/s/table/notes',payload:{expectedRevision:index,text:'',image:{name:'image',mediaType,data:data.toString('base64')}}});expect(result.statusCode).toBe(200);
  }
  const result=await app.inject({method:'PATCH',url:'/api/sessions/s/table/notes/missing',payload:{expectedRevision:3,text:'unknown'}});expect(result.statusCode).toBe(404);expect(notifications).toHaveLength(2);await app.close();
 });
 it('accepts a two million byte image under the route body limit',async()=>{const {app}=await setup();const data=Buffer.alloc(2_000_000);Buffer.from(image.data,'base64').copy(data);const res=await app.inject({method:'POST',url:'/api/sessions/s/table/notes',payload:{expectedRevision:1,text:'large',image:{...image,data:data.toString('base64')}}});expect(res.statusCode).toBe(200);await app.close()});
});
