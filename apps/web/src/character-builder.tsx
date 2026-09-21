import React,{useMemo,useState}from"react";
import{realmHeaders}from"./realm.js";
import{useI18n}from"./i18n/react.js";
const API=(import.meta as any).env?.VITE_API_URL??"http://localhost:8080/api";
async function call(path:string,init?:RequestInit){const r=await fetch(`${API}${path}`,{...init,headers:realmHeaders(init?.headers)}),x=await r.json();if(!r.ok)throw Error(x.message??`HTTP ${r.status}`);return x}
export function CharacterBuilder({schema,ownerKey,onCreated}:{schema:any;ownerKey:string;onCreated:(c:any)=>void}){
 const{t}=useI18n();
 const matches=(condition:any,data:Record<string,any>)=>!condition||(condition.in?condition.in.includes(data[condition.field]):Object.is(condition.equals,data[condition.field]));
 const defaults=Object.fromEntries((schema?.steps??[]).flatMap((s:any)=>s.fields).filter((f:any)=>f.default!==undefined).map((f:any)=>[f.id,f.default]));
 const[step,setStep]=useState(0),[values,setValues]=useState<Record<string,any>>(defaults),[error,setError]=useState("");const steps=(schema?.steps??[]).filter((s:any)=>matches(s.when,values)),current=steps[step]??steps.at(-1),fields=(current?.fields??[]).filter((f:any)=>matches(f.when,values));
 const calculated=useMemo(()=>Object.fromEntries((schema?.calculated??[]).map((c:any)=>[c.id,c.operation==="sum"?c.fields.reduce((sum:number,id:string)=>sum+Number(values[id]??0),0):values[c.fields[0]]])),[schema,values]);
 const valid=useMemo(()=>fields.every((f:any)=>!f.required||(values[f.id]!==undefined&&String(values[f.id]).trim()!=="")),[fields,values]);
 async function next(){if(step<steps.length-1){setStep(step+1);return}try{const c=await call("/characters",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({ownerKey,values})});onCreated(c)}catch(e:any){setError(e.message)}}
 if(!current)return <p>{t("character.noSchema")}</p>;
 return <section><p className="muted">{t("character.step",{current:step+1,total:steps.length})}</p><h2>{current.title}</h2>{fields.map((f:any)=><label key={f.id}>{f.label}{["choice","asset"].includes(f.type)?<select value={values[f.id]??""} onChange={e=>setValues({...values,[f.id]:e.target.value})}><option value="">{t("character.choose")}</option>{f.options?.map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:<input type={f.type==="number"?"number":"text"} value={values[f.id]??""} min={f.min} max={f.max} minLength={f.minLength} maxLength={f.maxLength} pattern={f.pattern} onChange={e=>setValues({...values,[f.id]:f.type==="number"?Number(e.target.value):e.target.value})}/>}</label>)}{step===steps.length-1&&Object.keys(calculated).length>0&&<p className="muted">{t("character.calculated")} · {Object.entries(calculated).map(([key,value])=>`${key}: ${value}`).join(" · ")}</p>}<div className="actions">{step>0&&<button className="secondary" onClick={()=>setStep(step-1)}>{t("common.back")}</button>}<button disabled={!valid} onClick={next}>{step===steps.length-1?t("character.create"):t("common.continue")}</button></div>{error&&<p className="error">{error}</p>}</section>
}
export async function loadCharacterSchema(){return call("/character-creation")}
export async function loadCharacters(ownerKey:string){return call("/characters",{headers:{"x-owner-key":ownerKey}})}
export async function selectCharacter(participantId:string,characterId:string,ownerKey:string,accessToken:string){return call(`/participants/${participantId}/character`,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${accessToken}`},body:JSON.stringify({characterId,ownerKey})})}
