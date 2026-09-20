import{randomUUID}from"node:crypto";
export interface WorldRevision{ id:string;worldId:string;number:number;parentRevision?:string;actor?:string;operation:string;summary?:string;changes:unknown;createdAt:string}
export function createRevision(x:{worldId:string;number:number;parentRevision?:string;actor?:string;operation:string;summary?:string;changes?:unknown}):WorldRevision{return{id:randomUUID(),worldId:x.worldId,number:x.number,parentRevision:x.parentRevision,actor:x.actor,operation:x.operation,summary:x.summary,changes:x.changes??{},createdAt:new Date().toISOString()}}
