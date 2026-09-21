import{randomInt,randomUUID}from"node:crypto";
import type{ActionStep}from"./actions.js";
export interface DieTerm{count:number;sides:number;sign:1|-1}
export interface DiceExpression{terms:DieTerm[];modifier:number;raw:string}
export interface DiceRoll{expression:string;terms:{sides:number;rolls:number[];subtotal:number;sign:1|-1}[];modifier:number;total:number}
export function parseDice(raw:string):DiceExpression{
 const s=raw.replace(/\s+/g,"").toLowerCase();if(!s)throw Error("empty dice expression");if(s.length>256)throw Error("dice expression too long");let i=0,modifier=0,totalDice=0;const terms:DieTerm[]=[];
 const re=/([+-]?)(?:(\d*)d(\d+)|(\d+))/gy;
 while(i<s.length){re.lastIndex=i;const m=re.exec(s);if(!m||m.index!==i)throw Error(`invalid dice expression at '${s.slice(i)}'`);const sign=m[1]==="-"?-1:1;
  if(m[3]){const count=m[2]?Number(m[2]):1,sides=Number(m[3]);totalDice+=count;if(count<1||totalDice>100||terms.length>=20||sides<2||sides>10000)throw Error("dice limits exceeded");terms.push({count,sides,sign})}
  else{modifier+=sign*Number(m[4]);if(!Number.isSafeInteger(modifier)||Math.abs(modifier)>1_000_000)throw Error("dice modifier limits exceeded")}i=re.lastIndex;
 }
 if(!terms.length)throw Error("dice expression requires at least one die");return{terms,modifier,raw:s};
}
export function rollDice(expression:string,roller:(sides:number)=>number=(s)=>randomInt(1,s+1)):DiceRoll{
 const p=parseDice(expression),terms=p.terms.map(t=>{const rolls=Array.from({length:t.count},()=>roller(t.sides)),subtotal=rolls.reduce((a,b)=>a+b,0)*t.sign;return{sides:t.sides,rolls,subtotal,sign:t.sign}}),total=terms.reduce((a,t)=>a+t.subtotal,0)+p.modifier;return{expression:p.raw,terms,modifier:p.modifier,total};
}
export type ResultVisibility="full"|"result-only"|"roll-only"|"hidden";
export interface CheckDefinition{id:string;label:string;dice:string;modifierField?:string}
export interface CheckRequest{id:string;sessionId:string;participantId:string;checkId:string;difficulty:number;visibility:ResultVisibility;status:"pending"|"resolved";createdAt:string}
export interface CheckResolution{requestId:string;roll:DiceRoll;modifier:number;total:number;difficulty:number;outcome:"success"|"failure";resolvedAt:string}
export function resolveCheck(req:CheckRequest,def:CheckDefinition,characterValues:Record<string,unknown>,roller?:(sides:number)=>number):CheckResolution{
 const roll=rollDice(def.dice,roller),modifier=def.modifierField?Number(characterValues[def.modifierField]??0):0,total=roll.total+modifier;
 return{requestId:req.id,roll,modifier,total,difficulty:req.difficulty,outcome:total>=req.difficulty?"success":"failure",resolvedAt:new Date().toISOString()};
}
export const newCheckRequest=(x:Omit<CheckRequest,"id"|"status"|"createdAt">):CheckRequest=>({...x,id:randomUUID(),status:"pending",createdAt:new Date().toISOString()});

export type ActionKind="check"|"resource"|"effect"|"custom";
export interface ActionDefinition{id:string;label:string;kind?:ActionKind;target:"self"|"actor"|"none"|"single-actor"|"multiple-actors";steps?:ActionStep[];checkId?:string;resource?:string;operation?:"add"|"subtract"|"set";amount?:number;effectId?:string}
export interface ResourceDefinition{id:string;label:string;min?:number;max?:number;default:number}
export interface EffectDefinition{id:string;label:string;duration?:{type:"turns"|"rounds"|"session"|"permanent";value?:number};modifiers?:Record<string,number>}
export interface ActorRuntimeState{actorId:string;resources:Record<string,number>;effects:ActiveEffect[];kind?:"npc";label?:string;templateId?:string;worldEntityId?:string;attributes?:Record<string,number>}
export interface ActiveEffect{id:string;definitionId:string;remaining?:number;appliedAt:string;sourceActorId?:string}
export function initializeResources(defs:Record<string,ResourceDefinition>,values:Record<string,unknown>={}):Record<string,number>{return Object.fromEntries(Object.entries(defs).map(([id,d])=>[id,Number(values[id]??d.default)]))}
export function applyResource(def:ResourceDefinition,current:number,op:"add"|"subtract"|"set",amount:number){let n=op==="set"?amount:op==="add"?current+amount:current-amount;if(def.min!==undefined)n=Math.max(def.min,n);if(def.max!==undefined)n=Math.min(def.max,n);return n}
export function applyEffect(def:EffectDefinition,sourceActorId?:string):ActiveEffect{return{id:randomUUID(),definitionId:def.id,remaining:def.duration&&["turns","rounds"].includes(def.duration.type)?def.duration.value:undefined,appliedAt:new Date().toISOString(),sourceActorId}}
export function effectiveModifier(base:number,field:string,effects:ActiveEffect[],defs:Record<string,EffectDefinition>){return effects.reduce((n,e)=>n+Number(defs[e.definitionId]?.modifiers?.[field]??0),base)}
export function tickEffects(effects:ActiveEffect[],unit:"turns"|"rounds",defs:Record<string,EffectDefinition>){return effects.flatMap(e=>{const d=defs[e.definitionId];if(!d?.duration||d.duration.type!==unit||e.remaining===undefined)return[e];const remaining=e.remaining-1;return remaining>0?[{...e,remaining}]:[]})}
export * from "./actions.js";
export * from "./encounters.js";
export * from "./replay.js";
export * from "./check-replay.js";
