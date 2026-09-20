export type DescriptorValue={mode:"default"}|{mode:"generated";generator?:string}|{mode:"constrained";constraints:Record<string,unknown>[]}|{mode:"explicit";value:unknown}|{mode:"inherited";source:string};
export interface WorldDescriptor{schemaVersion:string;worldPack:{id:string;version:string};decisions:Record<string,DescriptorValue>;locks:string[];seedPolicy:"random"|"explicit";seed?:string}
export interface MaterializedValue{value:unknown;source:"pack"|"generated"|"custom"|"runtime";sourceRef?:string;locked:boolean}
export interface WorldEntity{id:string;worldId:string;kind:string;templateRef?:string;materializationPath:string;parentId?:string;values:Record<string,MaterializedValue>;traits:string[];tags:string[];revision:number}
export interface MaterializedWorld{id:string;realmId:string;name:string;packId:string;packVersion:string;descriptor:WorldDescriptor;seed:string;status:"draft"|"ready"|"published"|"archived";entities:WorldEntity[];revision:number;createdAt:string;updatedAt:string}

export * from "./assets.js";
export * from "./artsets.js";

export * from "./runtime.js";
export * from "./character.js";
