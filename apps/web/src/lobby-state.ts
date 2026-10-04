export function allParticipantsReady(participants:Array<{ready?:boolean;characterId?:string}>){return participants.length>0&&participants.every(participant=>Boolean(participant.ready&&participant.characterId))}

export function savedJoinForPin(raw:string|null,invitePin:string){
 try{const saved=JSON.parse(raw??"null");if(!saved?.participant?.accessToken)return null;const savedPin=String(saved?.resolved?.session?.pin??"");return !invitePin||savedPin===invitePin?saved:null}catch{return null}
}

export async function openNextSession<T extends {id:string}>(campaignId:string,token:string,request:(path:string,body:Record<string,unknown>,token:string)=>Promise<T>):Promise<T>{
 const session=await request(`/campaigns/${campaignId}/sessions`,{},token);
 return request(`/sessions/${session.id}/state`,{state:'live'},token);
}
export function watchSessionSnapshot<T>(load:()=>Promise<T>,apply:(value:T)=>void,onError:(error:unknown)=>void){
 let stopped=false,busy=false;
 const poll=async()=>{if(stopped||busy)return;busy=true;try{const value=await load();if(!stopped)apply(value)}catch(error){if(!stopped)onError(error)}finally{busy=false}};
 const timer=setInterval(()=>void poll(),5000);
 return()=>{stopped=true;clearInterval(timer)};
}
