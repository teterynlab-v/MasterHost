export type RealmRole="owner"|"admin"|"creator"|"gm"|"player";
export interface Realm{id:string;slug:string;name:string;guestAccess:boolean;createdAt:string}
export interface Campaign{id:string;realmId:string;worldId:string;name:string;status:"draft"|"active"|"finished"|"archived";characterPortability:"exact"|"pack";createdAt:string;updatedAt:string}
export type SessionState="preparing"|"lobby"|"live"|"finished"|"cancelled";
export interface GameSession{id:string;realmId:string;campaignId:string;gmId?:string;state:SessionState;pin?:string;pinExpiresAt?:string;createdAt:string;startedAt?:string;finishedAt?:string}
export interface SessionParticipant{id:string;sessionId:string;displayName:string;profileId?:string;characterId?:string;ready:boolean;joinedAt:string;leftAt?:string}
export const canTransition=(from:SessionState,to:SessionState)=>({preparing:["lobby","cancelled"],lobby:["live","cancelled"],live:["finished","cancelled"],finished:[],cancelled:[]}[from] as SessionState[]).includes(to);
