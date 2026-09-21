import {describe,expect,it} from "vitest";
import {buildRehearsalReport,createTableState,visibleTableState} from "@masterhost/game-runtime";

describe("M15 table experience",()=>{
 it("builds ordered scenes and keeps GM notes out of the public view",()=>{
  const table=createTableState({sessionId:"session",scenes:[{id:"dock",title:"Silent Dock",sourceEntityId:"world-1"},{id:"vault",title:"Signal Vault"}]});
  table.privateNotes.push("The envoy is a traitor.");
  table.sharedNotes.push("Meet the envoy at dusk.");
  expect(table.phase).toBe("setup");
  expect(table.scenes.map(scene=>scene.status)).toEqual(["active","upcoming"]);
  expect(visibleTableState(table,true)).toEqual(table);
  const publicView=visibleTableState(table,false);
  expect(publicView).not.toHaveProperty("privateNotes");
  expect(JSON.stringify(publicView)).not.toContain("traitor");
  expect(publicView.sharedNotes).toEqual(["Meet the envoy at dusk."]);
 });

 it("reports every required rehearsal stage from authoritative state and events",()=>{
  const events=[
   {type:"TableStarted"},{type:"ActorInitialized"},{type:"ExplorationStarted"},{type:"ExplorationTokenMoved"},
   {type:"TableBeatRecorded",payload:{phase:"social"}},{type:"EncounterStarted"},{type:"EncounterEnded"},
   {type:"ItemGranted"},{type:"ProgressionChanged"},{type:"SessionReconnected"},
  ];
  const report=buildRehearsalReport({sessionId:"session",sessionState:"finished",participants:[{id:"player",characterId:"character"}],actors:[{actorId:"player"}],events});
  expect(report.gatePassed).toBe(true);
  expect(Object.values(report.stages).every(stage=>stage.passed)).toBe(true);
  expect(report.missing).toEqual([]);
 });

 it("keeps a partial rehearsal open and names each missing stage",()=>{
  const report=buildRehearsalReport({sessionId:"session",sessionState:"live",participants:[{id:"player",characterId:"character"}],actors:[],events:[{type:"TableStarted"}]});
  expect(report.gatePassed).toBe(false);
  expect(report.stages.setup.passed).toBe(false);
  expect(report.stages.characterCreation.passed).toBe(false);
  expect(report.missing).toContain("exploration");
  expect(report.missing).toContain("completion");
 });
});
