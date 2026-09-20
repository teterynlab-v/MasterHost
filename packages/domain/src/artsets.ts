import type{AssetRef,AssetRole,AssetSet}from"./assets.js";
export interface ArtSetManifest{id:string;name:string;description?:string;defaults?:Partial<Record<AssetRole,AssetRef>>;families?:Record<string,AssetSet>;types?:Record<string,AssetSet>}
export function artSetCandidates(x:{entity?:AssetSet;variant?:AssetSet;typeId?:string;familyId?:string;artSet?:ArtSetManifest;packDefault?:AssetSet}){
 return[
  {level:"entity"as const,assets:x.entity},
  {level:"variant"as const,assets:x.variant},
  {level:"type"as const,assets:x.typeId?x.artSet?.types?.[x.typeId]:undefined},
  {level:"family"as const,assets:x.familyId?x.artSet?.families?.[x.familyId]:undefined},
  {level:"art-set"as const,assets:x.artSet?.defaults?{roles:x.artSet.defaults}:undefined},
  {level:"pack-default"as const,assets:x.packDefault}
 ];
}
