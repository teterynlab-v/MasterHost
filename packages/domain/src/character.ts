export type CharacterFieldType="text"|"choice"|"number";
export interface CharacterField{id:string;label:string;type:CharacterFieldType;required?:boolean;options?:{value:string;label:string}[];min?:number;max?:number;default?:unknown}
export interface CharacterStep{id:string;title:string;fields:CharacterField[]}
export interface CharacterCreationSchema{steps:CharacterStep[]}
export interface Character{id:string;realmId:string;worldPackId:string;worldPackVersion:string;ownerProfileId?:string;displayName:string;values:Record<string,unknown>;createdAt:string;updatedAt:string}
