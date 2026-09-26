type SceneEntity={id:string;kind:string;values?:Record<string,{value?:unknown}>};
export function campaignScenes<T extends SceneEntity>(entities:T[],locationKinds:Set<string>):T[]{
 const openingId=entities.find(e=>e.kind==='campaign-kit')?.values?.openingSceneId?.value;
 const scenes=entities.filter(e=>e.kind==='scene');
 if(scenes.length)return scenes.slice().sort((a,b)=>Number(b.id===openingId||b.values?.deepId?.value===openingId)-Number(a.id===openingId||a.values?.deepId?.value===openingId));
 return entities.filter(e=>locationKinds.has(e.kind)||/(encounter|event)/i.test(e.kind));
}
