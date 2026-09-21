import {afterAll,beforeAll,describe,expect,it} from "vitest";
import postgres from "postgres";
import {randomUUID} from "node:crypto";
import {AdvancedEcosystemRepository,GameRepository} from "@masterhost/persistence";
import {createTableState} from "@masterhost/game-runtime";

const databaseUrl=process.env.TEST_DATABASE_URL;
const suite=databaseUrl?describe:describe.skip;

suite("M15 table repository",()=>{
 let repository:AdvancedEcosystemRepository,game:GameRepository;
 const sessionId=randomUUID();
 beforeAll(async()=>{game=new GameRepository(databaseUrl!);await game.migrate();repository=new AdvancedEcosystemRepository(databaseUrl!);await repository.migrate()});
 afterAll(async()=>{if(databaseUrl){const sql=postgres(databaseUrl);await sql`delete from game_events where session_id=${sessionId}`;await sql`delete from session_table_state where session_id=${sessionId}`;await sql.end()}await repository?.close();await game?.close()});

 it("persists table state and rejects a stale revision",async()=>{
  const created=await repository.createTable(createTableState({sessionId,scenes:[{id:"dock",title:"Silent Dock"}]}));
  expect(created.created).toBe(true);
  expect((await repository.table(sessionId))?.activeSceneId).toBe("dock");
  const updated=await repository.updateTable(sessionId,1,table=>{table.phase="social"},{type:"TablePhaseChanged",payload:{phase:"social"}});
  expect(updated.revision).toBe(2);
  await expect(repository.updateTable(sessionId,1,table=>{table.phase="reward"},{type:"TablePhaseChanged",payload:{phase:"reward"}})).rejects.toMatchObject({statusCode:409});
 });

 it("never persists private note text in the event stream",async()=>{
  const secret="The envoy is a traitor";
  const updated=await repository.updateTable(sessionId,2,table=>{table.privateNotes.push(secret)},{type:"TablePrivateNoteRecorded",payload:{text:secret}});
  expect(updated.privateNotes).toContain(secret);
  const events=await game.events(sessionId);
  const event=events.find(value=>value.type==="TablePrivateNoteRecorded");
  expect(event?.payload).toEqual({noteCount:1,tableRevision:3});
  expect(JSON.stringify(events)).not.toContain(secret);
 });
});
