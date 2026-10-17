import {afterAll,beforeAll,describe,it,expect} from 'vitest';
import postgres from 'postgres';
import {randomUUID} from 'node:crypto';
import {AdvancedEcosystemRepository,GameRepository,assetChecksum} from '@masterhost/persistence';
import {createTableState,mutateTablePrivateNote} from '@masterhost/game-runtime';
const url=process.env.TEST_DATABASE_URL;
(url?describe:describe.skip)('private note image transactions',()=>{
 let repo:AdvancedEcosystemRepository,game:GameRepository;const sessionId=randomUUID(),other=randomUUID();
 const data=Buffer.from([137,80,78,71,13,10,26,10]);
 const upload={data,checksum:assetChecksum(data),mediaType:'image/png',name:'private filename.png',size:data.length};
 const {data:_,...image}=upload;
 beforeAll(async()=>{game=new GameRepository(url!);await game.migrate();repo=new AdvancedEcosystemRepository(url!);await repo.migrate();await repo.createTable({...createTableState({sessionId,scenes:[]}),privateNotes:['old secret','other secret']});await repo.createTable(createTableState({sessionId:other,scenes:[]}))});
 afterAll(async()=>{if(url){const sql=postgres(url);await sql`delete from session_table_state where session_id in (${sessionId},${other})`;await sql`delete from game_events where session_id in (${sessionId},${other})`;await sql.end()}await repo?.close();await game?.close()});
 it('reads legacy entries and persists edits, images and synchronized legacy appends',async()=>{
  expect((await repo.table(sessionId))?.privateNoteEntries?.map(note=>note.id)).toEqual(['legacy-0','legacy-1']);
  const next=await repo.updateTable(sessionId,1,table=>mutateTablePrivateNote(table,{kind:'edit',id:'legacy-0',text:'edited secret',image}),{type:'TablePrivateNoteUpdated',payload:{text:'edited secret',image}},upload);
  expect(next.privateNoteEntries?.[0]?.image).not.toHaveProperty('data');
  expect(JSON.stringify(next)).not.toContain(data.toString('base64'));
  expect(next.privateNoteEntries?.[1]).toEqual({id:'legacy-1',text:'other secret'});
  expect(await repo.noteImage(sessionId,'legacy-0')).toMatchObject({mediaType:'image/png',data});
  expect(await repo.noteImage(other,'legacy-0')).toBeNull();
  const appended=await repo.updateTable(sessionId,2,table=>table.privateNotes.push('legacy append'),{type:'TablePrivateNoteRecorded',payload:{text:'legacy append'}});
  expect(appended.privateNoteEntries?.map(note=>note.text)).toEqual(['edited secret','other secret','legacy append']);
  expect(appended.privateNoteEntries?.[0]?.image).toEqual(image);
 });
 it('rejects stale image mutations without inserting an orphan',async()=>{
  const bytes=Buffer.concat([data,Buffer.from('another')]),stale={...upload,data:bytes,size:bytes.length,checksum:assetChecksum(bytes)};
  await expect(repo.updateTable(sessionId,1,table=>mutateTablePrivateNote(table,{kind:'edit',id:'legacy-0',text:'stale',image:stale}),{type:'TablePrivateNoteUpdated',payload:{}},stale)).rejects.toMatchObject({statusCode:409});
  const sql=postgres(url!);expect((await sql`select checksum from session_note_images where session_id=${sessionId}`).map(row=>row.checksum)).toEqual([image.checksum]);await sql.end();
 });
 it('allows only one concurrent writer and leaves bytes solely for the winning note',async()=>{
  const concurrentSession=randomUUID();await repo.createTable(createTableState({sessionId:concurrentSession,scenes:[]}));
  const candidates=['left','right'].map(id=>{const bytes=Buffer.concat([data,Buffer.from(id)]);return {id,upload:{...upload,data:bytes,size:bytes.length,checksum:assetChecksum(bytes)}}});
  const results=await Promise.allSettled(candidates.map(({id,upload})=>{
   const {data:_,...metadata}=upload;
   return repo.updateTable(concurrentSession,1,table=>mutateTablePrivateNote(table,{kind:'add',id,text:'concurrent',image:metadata}),{type:'TablePrivateNoteRecorded',payload:{}},upload);
  }));
  expect(results.filter(result=>result.status==='fulfilled')).toHaveLength(1);
  expect(results.find(result=>result.status==='rejected')).toMatchObject({reason:{statusCode:409}});
  const saved=await repo.table(concurrentSession),sql=postgres(url!);
  expect(saved?.revision).toBe(2);expect(saved?.privateNoteEntries).toHaveLength(1);
  expect((await sql`select checksum from session_note_images where session_id=${concurrentSession}`).map(row=>row.checksum)).toEqual([saved?.privateNoteEntries?.[0]?.image?.checksum]);
  await sql`delete from session_table_state where session_id=${concurrentSession}`;
  expect(await sql`select checksum from session_note_images where session_id=${concurrentSession}`).toHaveLength(0);
  await sql`delete from game_events where session_id=${concurrentSession}`;await sql.end();
 });
 it('cleans image bytes on replacement and deletion and strips every private event payload',async()=>{
  const data2=Buffer.concat([data,Buffer.from('replacement')]),replacement={...upload,data:data2,size:data2.length,checksum:assetChecksum(data2)};
  const {data:_,...metadata}=replacement;
  await repo.updateTable(sessionId,3,table=>mutateTablePrivateNote(table,{kind:'edit',id:'legacy-0',text:'new secret',image:metadata}),{type:'TablePrivateNoteUpdated',payload:{secret:'new secret',filename:metadata.name,checksum:metadata.checksum}},replacement);
  const sql=postgres(url!);expect((await sql`select checksum from session_note_images where session_id=${sessionId}`).map(row=>row.checksum)).toEqual([metadata.checksum]);
  await repo.updateTable(sessionId,4,table=>mutateTablePrivateNote(table,{kind:'delete',id:'legacy-0'}),{type:'TablePrivateNoteDeleted',payload:{secret:'old secret',image}});
  expect(await repo.noteImage(sessionId,'legacy-0')).toBeNull();expect(await sql`select checksum from session_note_images where session_id=${sessionId}`).toHaveLength(0);
  expect((await repo.table(sessionId))?.privateNoteEntries?.[0]?.id).toBe('legacy-1');
  for(const event of await game.events(sessionId))if(event.type.startsWith('TablePrivateNote'))expect(Object.keys(event.payload!).sort()).toEqual(['noteCount','tableRevision']);
  await sql.end();
 });
});
