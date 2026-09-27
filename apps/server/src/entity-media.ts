import {assetRoles} from '@masterhost/domain';
import type {AssetRole,PackArtSetManifest} from '@masterhost/domain';
type ArtEntity={kind:string;tags:string[]};
export function entityPackMedia(entity:ArtEntity,art:PackArtSetManifest|undefined):Partial<Record<AssetRole,string>>{
 const media:Partial<Record<AssetRole,string>>={};
 for(const role of assetRoles){const family=entity.tags.find(tag=>art?.families?.[tag]?.[role]);const path=art?.types?.[entity.kind]?.[role]??(family?art?.families?.[family]?.[role]:undefined)??art?.defaults?.[role];if(path)media[role]=path;}
 return media;
}
export function entityAvatarMedia(entity:ArtEntity,art:PackArtSetManifest|undefined){const own=entityPackMedia(entity,art?{...art,defaults:undefined}:undefined);return own.portrait??own.token??entityPackMedia(entity,art).portrait}
