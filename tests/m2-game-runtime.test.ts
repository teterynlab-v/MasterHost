import{describe,it,expect}from"vitest";import{parseDice,rollDice,newCheckRequest,resolveCheck}from"@masterhost/game-runtime";
describe("game runtime",()=>{
 it("parses dice expressions",()=>{expect(parseDice("2d6+3")).toEqual({terms:[{count:2,sides:6,sign:1}],modifier:3,raw:"2d6+3"});expect(parseDice("1d20-2").modifier).toBe(-2)});
 it("rejects expressions that exceed aggregate dice or modifier limits",()=>{expect(()=>parseDice("100d6+1d6")).toThrow(/limits exceeded/);expect(()=>parseDice(`1d20+${"9".repeat(40)}`)).toThrow(/modifier limits/)});
 it("records individual dice",()=>{const seq=[4,6];const r=rollDice("2d6+3",()=>seq.shift()!);expect(r.total).toBe(13);expect(r.terms[0]?.rolls).toEqual([4,6])});
 it("resolves server check with character modifier",()=>{const q=newCheckRequest({sessionId:"s",participantId:"p",checkId:"perception",difficulty:14,visibility:"full"}),r=resolveCheck(q,{id:"perception",label:"Perception",dice:"1d20",modifierField:"perception"},{perception:4},()=>13);expect(r.total).toBe(17);expect(r.outcome).toBe("success")});
});
