export type AssetRole="portrait"|"token"|"card"|"background"|"map"|"item"|"location"|"ui";
export interface AssetRef{id:string;path:string;checksum?:string}
export interface AssetSet{roles?:Partial<Record<AssetRole,AssetRef>>;variants?:Partial<Record<AssetRole,AssetRef[]>>}
export interface AssetCandidate{level:"entity"|"variant"|"type"|"family"|"art-set"|"pack-default";assets?:AssetSet}
export function resolveAsset(role:AssetRole,candidates:AssetCandidate[]){for(const c of candidates){const a=c.assets?.roles?.[role];if(a)return{asset:a,source:c.level,fallbackLevel:c.level}}return null}
