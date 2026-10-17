import {describe,it,expect} from 'vitest';
import postgres from 'postgres';
import {randomUUID} from 'node:crypto';
import {AdvancedEcosystemRepository} from '@masterhost/persistence';
const url=process.env.TEST_DATABASE_URL;
(url?describe:describe.skip)('advanced repository fresh migration concurrency',()=>{
 it('serializes repository DDL on one transaction connection',async()=>{
  const sql=postgres(url!),schema=`notes_${randomUUID().replaceAll('-','')}`;
  await sql`create schema ${sql(schema)}`;
  const scoped=new URL(url!);scoped.searchParams.set('search_path',schema);
  const repositories=Array.from({length:4},()=>new AdvancedEcosystemRepository(scoped.toString()));
  try{
   const results=await Promise.allSettled(repositories.map(repo=>repo.migrate()));
   expect(results.map(result=>result.status)).toEqual(['fulfilled','fulfilled','fulfilled','fulfilled']);
   const tables=await sql`select table_name from information_schema.tables where table_schema=${schema}`;
   expect(tables.map(row=>row.table_name)).toContain('session_note_images');
   expect(tables).toHaveLength(7);
  }finally{
   await Promise.all(repositories.map(repo=>repo.close()));
   await sql`drop schema ${sql(schema)} cascade`;await sql.end();
  }
 });
});
