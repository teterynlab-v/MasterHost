import type{WorldDescriptor}from"@masterhost/domain";import type{LoadedWorldPack}from"@masterhost/worldpack-sdk";import{condition,applyTraits,type EvalContext,type Condition,type TraitSpec}from"./runtime.js";
function hash(s:string){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function mulberry32(a:number){return()=>{let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
export function rngFor(seed:string,path:string){const r=mulberry32(hash(seed+":"+path));return{next:r,int:(a:number,b:number)=>Math.floor(r()*(b-a+1))+a,pick:<T>(v:readonly T[])=>{if(!v.length)throw Error("empty generator");return v[Math.floor(r()*v.length)]!}}}
export function weightedPick<T>(r:{next():number},e:{value:T;weight:number}[]){let x=r.next()*e.reduce((n,v)=>n+v.weight,0);for(const v of e){x-=v.weight;if(x<=0)return v.value}return e.at(-1)!.value}
export type DraftNode={path:string;kind:string;templateRef:string;parentPath?:string;values:Record<string,any>;traits:string[];tags:string[]};
type Ctx={pack:LoadedWorldPack;descriptor:WorldDescriptor;seed:string};
function descriptorMap(d:WorldDescriptor){return Object.fromEntries(Object.entries(d.decisions).filter(([,v])=>v.mode==="explicit").map(([k,v])=>[k,(v as any).value]))}
function lookup(o:Record<string,unknown>,p:string){return o[p]??p.split(".").reduce<any>((x,k)=>x?.[k],o)}
function spec(s:any,c:Ctx,path:string,local:Record<string,unknown>,parent:Record<string,unknown>){
 if("value"in s)return{value:s.value,source:"pack"};
 if("descriptor"in s){const m=descriptorMap(c.descriptor);return{value:lookup(m,s.descriptor)??s.default,source:c.descriptor.decisions[s.descriptor]?.mode==="explicit"?"custom":"pack",sourceRef:s.descriptor}}
 if("param"in s)return{value:lookup(local,s.param)??s.default,source:"pack",sourceRef:`param:${s.param}`};
 if("parent"in s)return{value:lookup(parent,s.parent)??s.default,source:"pack",sourceRef:`parent:${s.parent}`};
 if("generator"in s){const g=c.pack.content.generators[s.generator],r=rngFor(c.seed,path);if(!g)throw Error(`Missing generator ${s.generator}`);if(g.type==="values")return{value:r.pick(g.values),source:"generated",sourceRef:s.generator};if(g.type==="integer-range")return{value:r.int(g.min,g.max),source:"generated",sourceRef:s.generator};if(g.type==="weighted-table")return{value:weightedPick(r,g.entries),source:"generated",sourceRef:s.generator}}
 if("expression"in s)return{value:local[s.expression]??lookup(descriptorMap(c.descriptor),s.expression),source:"pack"};
 throw Error(`Bad spec ${path}`);
}
export function materializeTemplate(c:Ctx,ref:string,path="world",parentPath?:string,params:Record<string,unknown>={},parentValues:Record<string,unknown>={}):DraftNode[]{
 const t=c.pack.content.templates[ref];if(!t)throw Error(`Missing template ${ref}`);
 const local:Record<string,unknown>={...Object.fromEntries(Object.entries(t.parameters??{}).map(([k,v]:any)=>[k,v.default])),...params};
 for(const[k,v]of Object.entries(t.parameters??{})as any)if(v.required&&local[k]===undefined)throw Error(`Missing parameter ${k} for ${ref}`);
 const values:Record<string,any>={};
 for(const[k,s]of Object.entries(t.values??{})){const r=spec(s,c,`${path}.value.${k}`,local,parentValues);local[k]=r.value;values[k]={...r,locked:Boolean(r.sourceRef&&c.descriptor.locks.includes(r.sourceRef))}}
 const evalCtx:EvalContext={descriptor:descriptorMap(c.descriptor),params:local,self:local,parent:parentValues};
 const traits=(t.traits??[]).map((id:string)=>{const tr=(c.pack.content as any).traits?.[id];if(!tr)throw Error(`Missing trait ${id}`);return tr as TraitSpec});
 const applied=applyTraits(Object.fromEntries(Object.entries(values).map(([k,v])=>[k,v.value])),[...(t.tags??[])],traits,evalCtx);
 for(const[k,v]of Object.entries(applied.values))if(values[k])values[k].value=v;else values[k]={value:v,source:"pack",locked:false};
 const n:DraftNode={path,kind:t.kind,templateRef:ref,parentPath,values,traits:[...(t.traits??[])],tags:applied.tags},out=[n];
 for(const[name,x]of Object.entries(t.components??{})as any){
  if(!condition(x.when,{...evalCtx,self:applied.values}))continue;
  let count=1;if(typeof x.count==="number")count=x.count;else if(x.count)count=Number(spec(x.count,c,`${path}.${name}.count`,local,parentValues).value);
  for(let i=0;i<count;i++){const cp:Record<string,unknown>={};for(const[pk,ps]of Object.entries(x.parameters??{}))cp[pk]=spec(ps,c,`${path}.${name}.${i}.param.${pk}`,local,applied.values).value;out.push(...materializeTemplate(c,x.template,`${path}.${name}.${i}`,path,cp,applied.values))}
 }return out;
}
export * from "./runtime.js";
