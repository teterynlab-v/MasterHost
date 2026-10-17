import {afterAll,beforeAll,describe,it,expect} from 'vitest';
import postgres from 'postgres';
import {randomUUID} from 'node:crypto';
import {AdvancedEcosystemRepository,GameRepository,assetChecksum} from '@masterhost/persistence';
import {createTableState,mutateTablePrivateNote} from '@masterhost/game-runtime';
const url=process.env.TEST_DATABASE_URL;
(url?describe:describe.skip)('private notes survive an API rollback without leaking structured entries',()=>{
 let repo:AdvancedEcosystemRepository,game:GameRepository;
 const sessionId=randomUUID(),data=Buffer.from([137,80,78,71,13,10,26,10]);
 const image={checksum:assetChecksum(data),mediaType:'image/png',name:'private.png',size:data.length};
 beforeAll(async()=>{repo=new AdvancedEcosystemRepository(url!);game=new GameRepository(url!);await game.migrate();await repo.migrate()});
 afterAll(async()=>{const sql=postgres(url!);await sql`delete from session_table_state where session_id=${sessionId}`;await sql`delete from game_events where session_id=${sessionId}`;await sql.end();await repo.close();await game.close()});
 it('keeps structured entries outside the snapshot read by the old API',async()=>{
  await repo.createTable({...createTableState({sessionId,scenes:[]}),privateNotes:['legacy']});
  await repo.updateTable(sessionId,1,table=>mutateTablePrivateNote(table,{kind:'add',id:'with-image',text:'secret',image}),{type:'TablePrivateNoteRecorded',payload:{}},{...image,data});
  const sql=postgres(url!);
  try{
   const row=(await sql`select state,private_note_entries from session_table_state where session_id=${sessionId}`)[0]!;
   expect(row.state).not.toHaveProperty('privateNoteEntries');
   expect(row.state.privateNotes).toEqual(['legacy','secret']);
   expect(row.private_note_entries).toEqual([{id:'legacy-0',text:'legacy'},{id:'with-image',text:'secret',image}]);
   // Exact old API projection strips privateNotes and has no knowledge of the new column.
   const {privateNotes:_,...oldPublic}=row.state;expect(JSON.stringify(oldPublic)).not.toMatch(/secret|private.png|checksum|with-image/);
   expect((await repo.table(sessionId))?.privateNoteEntries).toEqual(row.private_note_entries);
  }finally{await sql.end()}
 });
 it('separates structured entries on creation and migrates intermediate snapshots',async()=>{
  const id=randomUUID(),migratedId=randomUUID(),entries=[{id:'saved-id',text:'saved',image}];
  const sql=postgres(url!);
  try{
   await repo.createTable({...createTableState({sessionId:id,scenes:[]}),privateNotes:['saved'],privateNoteEntries:entries});
   let row=(await sql`select state,private_note_entries from session_table_state where session_id=${id}`)[0]!;
   expect(row.state).not.toHaveProperty('privateNoteEntries');expect(row.private_note_entries).toEqual(entries);
   const intermediate={...createTableState({sessionId:migratedId,scenes:[]}),privateNotes:['saved'],privateNoteEntries:entries};
   await sql`insert into session_table_state(session_id,revision,state) values(${migratedId},1,${sql.json(intermediate as any)})`;
   await repo.migrate();
   row=(await sql`select state,private_note_entries from session_table_state where session_id=${migratedId}`)[0]!;
   expect(row.state).not.toHaveProperty('privateNoteEntries');expect(row.private_note_entries).toEqual(entries);
   expect((await repo.table(migratedId))?.privateNoteEntries).toEqual(entries);
  }finally{
   await sql`delete from session_table_state where session_id in (${id},${migratedId})`;
   await sql`delete from game_events where session_id in (${id},${migratedId})`;await sql.end();
  }
 });
 it('reconciles strings appended or truncated by the old API with stable IDs and images',async()=>{
  const sql=postgres(url!);
  try{
   await sql`update session_table_state set revision=3,state=jsonb_set(jsonb_set(state,'{privateNotes}',${sql.json(['secret','after rollback','after rollback'])}),'{revision}','3') where session_id=${sessionId}`;
   const first=await repo.table(sessionId),second=await repo.table(sessionId);
   expect(first?.privateNoteEntries).toEqual(second?.privateNoteEntries);
   expect(first?.privateNoteEntries?.[0]).toEqual({id:'with-image',text:'secret',image});
   expect(first?.privateNoteEntries?.map(note=>note.text)).toEqual(['secret','after rollback','after rollback']);
   expect(new Set(first?.privateNoteEntries?.map(note=>note.id)).size).toBe(3);
   const updated=await repo.updateTable(sessionId,3,table=>mutateTablePrivateNote(table,{kind:'edit',id:'with-image',text:'edited secret'}),{type:'TablePrivateNoteUpdated',payload:{}});
   expect(updated.privateNoteEntries?.[1]?.id).toBe(first?.privateNoteEntries?.[1]?.id);
   expect(updated.privateNoteEntries?.[0]?.image).toEqual(image);
   const row=(await sql`select state,private_note_entries from session_table_state where session_id=${sessionId}`)[0]!;
   expect(row.state).not.toHaveProperty('privateNoteEntries');expect(row.private_note_entries).toEqual(updated.privateNoteEntries);
   expect(await repo.noteImage(sessionId,'with-image')).toMatchObject({data,mediaType:image.mediaType});
  }finally{await sql.end()}
 });
});
