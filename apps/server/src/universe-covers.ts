import {reviewQuickGameSelection,type GameAsset,type GameAssetMedia} from '@masterhost/descriptor';
export function universeCovers(assets:GameAsset[],packId:string):Array<{assetVersion:string;media:GameAssetMedia}>{
 const illustrated=assets.filter(asset=>asset.compatibility.basePackIds.includes(packId)&&asset.preview.highlights.includes('Illustrated Universe v1'));
 const covers:Array<{assetVersion:string;media:GameAssetMedia}>=[];
 for(const version of [...new Set(illustrated.map(asset=>asset.version))].sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}))){
  const bundle=illustrated.filter(asset=>asset.version===version);
  if(!reviewQuickGameSelection(assets,packId,bundle.map(asset=>({id:asset.id,version:asset.version}))).ready)continue;
  const visual=bundle.find(asset=>asset.type==='visuals')!;
  const art=visual.fragment.patches.find(patch=>patch.path===`/artSets/${visual.fragment.defaultArtSet}`)?.value as {defaults?:{card?:string}}|undefined;
  const name=art?.defaults?.card?.replace(/^assets\//,'');
  const media=visual.media.find(image=>image.name===name);
  if(media)covers.push({assetVersion:version,media});
 }
 return covers;
}
