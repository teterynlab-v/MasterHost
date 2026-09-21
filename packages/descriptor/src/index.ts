import type{DescriptorValue,WorldDescriptor}from"@masterhost/domain";
export function buildDescriptor(x:{packId:string;packVersion:string;choices:{path:string;value:DescriptorValue;locked?:boolean}[];seed?:string}):WorldDescriptor{const decisions:Record<string,DescriptorValue>={},locks:string[]=[];for(const c of x.choices){decisions[c.path]=c.value;if(c.locked)locks.push(c.path)}return{schemaVersion:"0.1",worldPack:{id:x.packId,version:x.packVersion},decisions,locks,seedPolicy:x.seed?"explicit":"random",seed:x.seed}}
export * from "./composition.js";
