import{describe,expect,it}from"vitest";
import{changeProgression,executeAction,grantItem,moveActor,replayRuntimeEvents,resolveCheck,transferItem}from"@masterhost/game-runtime";
import type{ActorRuntimeState,CheckRequest,ReplayEvent}from"@masterhost/game-runtime";
const actor=(actorId:string,inventory:ActorRuntimeState["inventory"]=[]):ActorRuntimeState=>({actorId,resources:{health:10},effects:[],inventory,progression:{xp:0}});
describe("M3 Pack-driven runtime state",()=>{
 it("grants and transfers bounded items, progression and locations",()=>{const item={id:"potion",label:"Potion",stackLimit:5},a=actor("a"),b=actor("b");const granted=grantItem("s",a,item,3);expect(granted.state.inventory).toEqual([{itemId:"potion",quantity:3}]);const moved=transferItem("s",granted.state,b,item,2);expect(moved.states.map(value=>value.inventory)).toEqual([[{itemId:"potion",quantity:1}],[{itemId:"potion",quantity:2}]]);expect(()=>transferItem("s",moved.states[0]!,moved.states[1]!,item,2)).toThrow(/insufficient/);expect(changeProgression("s",a,{id:"xp",label:"XP",min:0,max:10,default:0},4).state.progression).toEqual({xp:4});expect(()=>changeProgression("s",a,{id:"xp",label:"XP",max:3,default:0},4)).toThrow(/outside bounds/);expect(moveActor("s",a,"town").state.locationId).toBe("town")});
 it("replays inventory, progression and location events",()=>{const events:ReplayEvent[]=[
  {sequence:1,type:"ActorInitialized",schemaVersion:"1",payload:actor("a") as unknown as Record<string,unknown>},
  {sequence:2,type:"ActorInitialized",schemaVersion:"1",payload:actor("b") as unknown as Record<string,unknown>},
  {sequence:3,type:"ItemGranted",schemaVersion:"1",payload:{actorId:"a",itemId:"potion",after:3}},
  {sequence:4,type:"ItemTransferred",schemaVersion:"1",payload:{fromActorId:"a",toActorId:"b",itemId:"potion",fromAfter:1,toAfter:2}},
  {sequence:5,type:"ProgressionChanged",schemaVersion:"1",payload:{actorId:"b",progressionId:"xp",after:4}},
  {sequence:6,type:"ActorMoved",schemaVersion:"1",payload:{actorId:"b",toLocationId:"town"}}
 ];const replay=replayRuntimeEvents(events);expect(replay.issues).toEqual([]);expect(replay.actors.find(value=>value.actorId==="b")).toMatchObject({inventory:[{itemId:"potion",quantity:2}],progression:{xp:4},locationId:"town"})});
 it("resolves Pack critical rules and lets effects block declared actions",()=>{const request:CheckRequest={id:"c",sessionId:"s",participantId:"a",checkId:"test",difficulty:99,visibility:"full",status:"pending",createdAt:new Date().toISOString()};expect(resolveCheck(request,{id:"test",label:"Test",dice:"1d20",criticalSuccess:{rollTotalAtLeast:20}}, {},()=>20).outcome).toBe("critical-success");const blocked=actor("a");blocked.effects=[{id:"e",definitionId:"jammed",appliedAt:new Date().toISOString()}];expect(()=>executeAction({action:{id:"fire",label:"Fire",kind:"resource",target:"self",resource:"ammo",operation:"subtract",amount:1},request:{sessionId:"s",actionId:"fire",actorId:"a"},actors:{a:blocked},checks:{},resources:{ammo:{id:"ammo",label:"Ammo",default:1,min:0}},effects:{jammed:{id:"jammed",label:"Jammed",blockedActions:["fire"]}}})).toThrow(/blocked by effect jammed/)});
});
