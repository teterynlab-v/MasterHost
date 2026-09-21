import React,{useState}from"react";

const roles=["portrait","token","card","background","map","item","location","ui"];
export function EntityImages({worldId,entity,images,api,onAssign}:{worldId:string;entity:{id:string;assets?:{roles?:Record<string,{path:string}>}};images:Record<string,unknown>;api:string;onAssign:(role:string,name:string|null)=>Promise<void>}){
 const[role,setRole]=useState("portrait"),[name,setName]=useState("");
 const names=Object.keys(images),selected=names.includes(name)?name:names[0]??"";
 return <div className="entityImages">
  {Object.entries(entity.assets?.roles??{}).map(([assignedRole,ref])=><div key={assignedRole}><span>{assignedRole}</span><img className="entityImage" alt={`${assignedRole} for entity`} src={`${api}/worlds/${worldId}/assets/${encodeURIComponent(ref.path)}?inline=1`}/><button className="tiny" onClick={()=>void onAssign(assignedRole,null)}>Remove image</button></div>)}
  {names.length>0&&<div className="actions"><label>Image role<select value={role} onChange={event=>setRole(event.target.value)}>{roles.map(value=><option key={value} value={value}>{value}</option>)}</select></label><label>World image<select value={selected} onChange={event=>setName(event.target.value)}>{names.map(value=><option key={value} value={value}>{value}</option>)}</select></label><button className="secondary" onClick={()=>void onAssign(role,selected)}>Attach image</button></div>}
 </div>;
}
