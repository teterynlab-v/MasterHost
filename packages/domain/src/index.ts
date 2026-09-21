import type { AssetRole,AssetSet } from "./assets.js";
export type DescriptorValue={mode:"default"}|{mode:"generated";generator?:string}|{mode:"constrained";constraints:Record<string,unknown>[]}|{mode:"explicit";value:unknown}|{mode:"inherited";source:string};
export interface WorldDescriptor{schemaVersion:string;worldPack:{id:string;version:string};decisions:Record<string,DescriptorValue>;locks:string[];seedPolicy:"random"|"explicit";seed?:string;composition?:{projectId:string;revision:number;selections:{fragmentId:string;version:string;parameters:Record<string,string|number|boolean>}[]}}
export interface MaterializedValue{value:unknown;source:"pack"|"generated"|"custom"|"runtime";sourceRef?:string;locked:boolean}
export interface WorldEntity{id:string;worldId:string;kind:string;templateRef?:string;materializationPath:string;parentId?:string;values:Record<string,MaterializedValue>;traits:string[];tags:string[];assets?:AssetSet;revision:number}
export interface WorldAssetMetadata{title?:string;tags:string[];variants:string[]}
export interface WorldArtSet{id:string;name:string;description?:string;defaults?:Partial<Record<AssetRole,string>>;families?:Record<string,Partial<Record<AssetRole,string>>>;types?:Record<string,Partial<Record<AssetRole,string>>>}
export interface WorldAuthoring{assetMetadata?:Record<string,WorldAssetMetadata>;artSets?:Record<string,WorldArtSet>;activeArtSetId?:string}
export interface MaterializedWorld{id:string;realmId:string;name:string;packId:string;packVersion:string;descriptor:WorldDescriptor;seed:string;status:"draft"|"ready"|"published"|"archived";entities:WorldEntity[];assets?:Record<string,{checksum:string;mediaType:string;size:number}>;authoring?:WorldAuthoring;revision:number;createdAt:string;updatedAt:string}

export * from "./assets.js";
export * from "./artsets.js";

export * from "./runtime.js";
export * from "./character.js";
