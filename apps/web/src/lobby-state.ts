export function allParticipantsReady(participants:Array<{ready?:boolean;characterId?:string}>){return participants.length>0&&participants.every(participant=>Boolean(participant.ready&&participant.characterId))}

export function savedJoinForPin(raw:string|null,invitePin:string){
 try{const saved=JSON.parse(raw??"null");if(!saved?.participant?.accessToken)return null;const savedPin=String(saved?.resolved?.session?.pin??"");return !invitePin||savedPin===invitePin?saved:null}catch{return null}
}
