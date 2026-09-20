import React,{useMemo,useState}from"react";
const API=(import.meta as any).env?.VITE_API_URL??"http://localhost:8080/api";
async function call(path:string,init?:RequestInit){const r=await fetch(`${API}${path}`,init),x=await r.json();if(!r.ok)throw Error(x.message??`HTTP ${r.status}`);return x}
export function CharacterBuilder({schema,ownerKey,onCreated}:{schema:any;ownerKey:string;onCreated:(c:any)=>void}){
 const[step,setStep]=useState(0),[values,setValues]=useState<Record<string,any>>({}),[error,setError]=useState("");const steps=schema?.steps??[],current=steps[step];
 const valid=useMemo(()=>current?.fields?.every((f:any)=>!f.required||(values[f.id]!==undefined&&String(values[f.id]).trim()!==""))??false,[current,values]);
 async function next(){if(step<steps.length-1){setStep(step+1);return}try{const c=await call("/characters",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({ownerKey,values})});onCreated(c)}catch(e:any){setError(e.message)}}
 if(!current)return <p>No character creation schema in this World Pack.</p>;
 return <section><p className="muted">Character · step {step+1}/{steps.length}</p><h2>{current.title}</h2>{current.fields.map((f:any)=><label key={f.id}>{f.label}{f.type==="choice"?<select value={values[f.id]??""} onChange={e=>setValues({...values,[f.id]:e.target.value})}><option value="">Choose…</option>{f.options?.map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:<input type={f.type==="number"?"number":"text"} value={values[f.id]??""} min={f.min} max={f.max} onChange={e=>setValues({...values,[f.id]:f.type==="number"?Number(e.target.value):e.target.value})}/>}</label>)}<div className="actions">{step>0&&<button className="secondary" onClick={()=>setStep(step-1)}>Back</button>}<button disabled={!valid} onClick={next}>{step===steps.length-1?"Create character":"Continue"}</button></div>{error&&<p className="error">{error}</p>}</section>
}
export async function loadCharacterSchema(){return call("/character-creation")}
export async function loadCharacters(ownerKey:string,packId:string,packVersion:string){return call(`/characters?packId=${encodeURIComponent(packId)}&packVersion=${encodeURIComponent(packVersion)}`,{headers:{"x-owner-key":ownerKey}})}
export async function selectCharacter(participantId:string,characterId:string,ownerKey:string,accessToken:string){return call(`/participants/${participantId}/character`,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${accessToken}`},body:JSON.stringify({characterId,ownerKey})})}
