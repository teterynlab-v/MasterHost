import {describe,expect,it} from "vitest";
import {buildCampaignRecap,filterCommunityCatalog,redactSpectatorTimeline,visibleExplorationBoard} from "@masterhost/game-runtime";
import type {ExplorationBoard} from "@masterhost/game-runtime";

describe("M9 advanced ecosystem",()=>{
 it("redacts hidden fog geometry for players and spectators",()=>{
  const board:ExplorationBoard={id:"board",sessionId:"session",worldId:"world",revision:3,nodes:[{id:"a",label:"Atrium",x:10,y:20},{id:"vault",label:"Secret Vault",x:0.5,y:0.5}],tokens:[{actorId:"actor",nodeId:"a"},{actorId:"spy",nodeId:"vault"}],fog:[{id:"secret",label:"Vault",revealed:false,polygon:[[0,0],[1,0],[1,1],[0,1]]},{id:"seen",label:"Hall",revealed:true,polygon:[[2,2],[3,2],[3,3]]}],updatedAt:"now"};
  expect(visibleExplorationBoard(board,true).fog).toHaveLength(2);
  expect(visibleExplorationBoard(board,false).fog).toEqual([{id:"seen",label:"Hall",revealed:true}]);
  expect(visibleExplorationBoard(board,false).nodes.map(value=>value.id)).toEqual(["a"]);
  expect(visibleExplorationBoard(board,false).tokens.map(value=>value.actorId)).toEqual(["actor"]);
 });
 it("builds the same factual recap from the same ordered event stream",()=>{
  const events=[
   {sequence:2,type:"NarrativeEventRecorded",payload:{text:"The gate opened."},createdAt:"2026-01-01T00:02:00Z"},
   {sequence:1,type:"TravelCompleted",payload:{locationName:"Old Port"},createdAt:"2026-01-01T00:01:00Z"},
   {sequence:3,type:"CheckResolved",payload:{outcome:"success"},createdAt:"2026-01-01T00:03:00Z"},
  ];
  const first=buildCampaignRecap("campaign",events),second=buildCampaignRecap("campaign",[...events].reverse());
  expect(first).toEqual(second);
  expect(first.entries.map(value=>value.text)).toEqual(["Travelled to Old Port.","The gate opened.","Check resolved: success."]);
  expect(first.provider).toBe("deterministic");
 });
 it("discovers community packs with stable search and filters",()=>{
  const catalog=[
   {realmSlug:"ember",packId:"packs.ember",version:"1.0.0",name:"Ember Crown",description:"Heroic fire fantasy",tags:["fantasy","heroic"],license:"CC-BY-4.0"},
   {realmSlug:"neon",packId:"packs.neon",version:"2.0.0",name:"Neon Circuit",description:"Cyberpunk heists",tags:["cyberpunk"],license:"MIT"},
  ];
  expect(filterCommunityCatalog(catalog,{query:"fire",tag:"fantasy",license:"CC-BY-4.0"}).map(value=>value.packId)).toEqual(["packs.ember"]);
  expect(filterCommunityCatalog(catalog,{query:"NEON"}).map(value=>value.packId)).toEqual(["packs.neon"]);
 });
 it("removes non-public checks from spectator replay",()=>{
  const events:any[]=[{sequence:1,type:"CheckRequested",payload:{id:"secret",visibility:"hidden"}},{sequence:2,type:"DiceRolled",payload:{requestId:"secret"}},{sequence:3,type:"CheckResolved",payload:{requestId:"secret",outcome:"failure"}},{sequence:4,type:"CheckRequested",payload:{id:"public",visibility:"full"}},{sequence:5,type:"CheckResolved",payload:{requestId:"public",outcome:"success"}}];
  expect(redactSpectatorTimeline(events).map(value=>value.sequence)).toEqual([4,5]);
 });
});
