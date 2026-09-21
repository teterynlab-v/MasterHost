export type AssetRole="portrait"|"token"|"card"|"background"|"map"|"item"|"location"|"ui";
export interface AssetRef{id:string;path:string;checksum?:string}
export interface AssetSet{roles?:Partial<Record<AssetRole,AssetRef>>;variants?:Partial<Record<AssetRole,AssetRef[]>>}
export interface AssetCandidate{level:"entity"|"variant"|"type"|"family"|"art-set"|"pack-default";assets?:AssetSet}
export function resolveAsset(role:AssetRole,candidates:AssetCandidate[]){for(const c of candidates){const a=c.assets?.roles?.[role];if(a)return{asset:a,source:c.level,fallbackLevel:c.level}}return null}
export const assetRoles:AssetRole[]=["portrait","token","card","background","map","item","location","ui"];
export function assertWorldAssetReferences(world:{assets?:Record<string,{checksum:string}>;entities:{assets?:AssetSet}[]}){
 for(const entity of world.entities){
  if(!entity.assets)continue;
  if(Object.keys(entity.assets).some(key=>key!=="roles")||!entity.assets.roles||typeof entity.assets.roles!=="object"||Array.isArray(entity.assets.roles))throw Error("invalid entity image assignments");
  for(const [role,ref]of Object.entries(entity.assets.roles)){
   if(!assetRoles.includes(role as AssetRole)||!ref||typeof ref.id!=="string"||ref.id!==ref.path||typeof ref.checksum!=="string"||world.assets?.[ref.path]?.checksum!==ref.checksum)throw Error(`invalid entity image assignment ${role}`);
  }
 }
}
