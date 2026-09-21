import{realmHeaders}from"./realm.js";
const API=(import.meta as any).env?.VITE_API_URL??"http://localhost:8080/api";
export async function resolvePin(pin:string){const r=await fetch(`${API}/join/resolve-global`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({pin})});if(!r.ok)throw Error((await r.json()).message??"PIN not found");return r.json()}
export async function joinGuest(sessionId:string,pin:string,displayName:string){const r=await fetch(`${API}/sessions/${sessionId}/join`,{method:"POST",headers:realmHeaders({"content-type":"application/json"}),body:JSON.stringify({pin,displayName})});if(!r.ok)throw Error((await r.json()).message??"Unable to join");return r.json()}

export type ConnectionStatus="connecting"|"live"|"recovering"|"offline"|"closed";
export function sessionSocket(sessionId:string,credential:string,onEvent:(event:any)=>void,onStatus?:(status:ConnectionStatus)=>void){
 const configured=(import.meta as any).env?.VITE_WS_URL,base=configured||`${location.protocol==="https:"?"wss":"ws"}://${location.host}`,storageKey=`masterhost.session-sequence.${sessionId}`;
 let socket:WebSocket|undefined,stopped=false,retry=0,timer:number|undefined,lastSequence=Number(sessionStorage.getItem(storageKey)??0);
 const status=(value:ConnectionStatus)=>onStatus?.(value);
 const connect=()=>{
  if(stopped)return;status(retry?"recovering":"connecting");socket=new WebSocket(`${base}/ws/sessions/${sessionId}`);
  socket.onopen=()=>socket?.send(JSON.stringify({type:"authenticate",token:credential,afterSequence:lastSequence}));
  socket.onmessage=message=>{const event=JSON.parse(message.data);if(Number.isSafeInteger(event.sequence)&&event.sequence>lastSequence){lastSequence=event.sequence;sessionStorage.setItem(storageKey,String(lastSequence))}retry=0;status("live");onEvent(event)};
  socket.onclose=event=>{socket=undefined;if(stopped)return;if(event.code===1008){stopped=true;status("closed");return}status(navigator.onLine?"recovering":"offline");const delay=Math.min(5000,250*2**retry++);timer=window.setTimeout(connect,delay)};
  socket.onerror=()=>socket?.close();
 };
 const online=()=>{if(!stopped&&!socket){if(timer)clearTimeout(timer);connect()}},offline=()=>status("offline");
 addEventListener("online",online);addEventListener("offline",offline);connect();
 return{close(){stopped=true;if(timer)clearTimeout(timer);removeEventListener("online",online);removeEventListener("offline",offline);socket?.close();status("closed")}};
}
