import{describe,expect,it}from"vitest";
import{allParticipantsReady,savedJoinForPin}from"./lobby-state.js";

describe("GM lobby readiness",()=>{
 it("starts only when every joined participant has a character and is ready",()=>{
  expect(allParticipantsReady([])).toBe(false);
  expect(allParticipantsReady([{ready:true,characterId:"hero-1"},{ready:false,characterId:"hero-2"}])).toBe(false);
  expect(allParticipantsReady([{ready:true,characterId:"hero-1"},{ready:true}])).toBe(false);
 expect(allParticipantsReady([{ready:true,characterId:"hero-1"},{ready:true,characterId:"hero-2"}])).toBe(true);
 });
 it("reuses the saved participant for the same invite PIN",()=>{
  const saved={participant:{accessToken:"secret"},resolved:{session:{pin:"209051"}}};
  expect(savedJoinForPin(JSON.stringify(saved),"209051")).toEqual(saved);
  expect(savedJoinForPin(JSON.stringify(saved),"999999")).toBeNull();
 });
});
