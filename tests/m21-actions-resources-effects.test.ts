import{describe,it,expect}from"vitest";import{initializeResources,applyResource,applyEffect,effectiveModifier,tickEffects}from"@masterhost/game-runtime";
describe("generic resources/effects",()=>{
 it("initializes and clamps resources",()=>{const d={health:{id:"health",label:"Health",min:0,max:30,default:20}};expect(initializeResources(d).health).toBe(20);expect(applyResource(d.health,3,"subtract",5)).toBe(0);expect(applyResource(d.health,29,"add",5)).toBe(30)});
 it("applies effect modifiers and expiration",()=>{const defs={poisoned:{id:"poisoned",label:"Poisoned",duration:{type:"turns"as const,value:2},modifiers:{perception:-2}}},e=applyEffect(defs.poisoned);expect(effectiveModifier(4,"perception",[e],defs)).toBe(2);const one=tickEffects([e],"turns",defs);expect(one[0]?.remaining).toBe(1);expect(tickEffects(one,"turns",defs)).toEqual([])});
});
