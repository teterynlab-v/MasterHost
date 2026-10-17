import React,{useState} from 'react';
import type {Locale} from './i18n/catalog.js';

export type SceneStageMode='scene'|'map';
type Labels={scene:string;map:string;view:string;unavailable:string;summary:string};
export const sceneStageCopy:Record<Locale,Labels>={
 en:{scene:'Scene',map:'Map',view:'Table view',unavailable:'Scene illustration unavailable',summary:'The scene is ready to explore.'},
 ru:{scene:'Сцена',map:'Карта',view:'Вид стола',unavailable:'Иллюстрация сцены недоступна',summary:'Сцена готова к исследованию.'},
 es:{scene:'Escena',map:'Mapa',view:'Vista de la mesa',unavailable:'Ilustración de la escena no disponible',summary:'La escena está lista para explorar.'},
 ja:{scene:'シーン',map:'マップ',view:'テーブル表示',unavailable:'シーンのイラストはありません',summary:'シーンを探索できます。'},
 'zh-CN':{scene:'场景',map:'地图',view:'桌面视图',unavailable:'场景插画不可用',summary:'可以开始探索场景。'},
 ko:{scene:'장면',map:'지도',view:'테이블 보기',unavailable:'장면 일러스트를 사용할 수 없습니다',summary:'장면을 탐험할 준비가 되었습니다.'},
};
export function sceneStageMode(selection:{sceneId?:string;mode:SceneStageMode},sceneId?:string):SceneStageMode{return selection.sceneId===sceneId?selection.mode:'scene'}
export function SceneStageSwitch({mode,labels,onChange}:{mode:SceneStageMode;labels:Labels;onChange:(mode:SceneStageMode)=>void}){
 return <div className="sceneStageSwitch" role="group" aria-label={labels.view}>{(['scene','map'] as const).map(value=><button type="button" key={value} className="secondary" aria-pressed={mode===value} onClick={()=>onChange(value)}>{labels[value]}</button>)}</div>;
}
export function SceneStage({title,summary,sceneAssetUrl,mapAssetUrl,labels}:{title:string;summary?:string;sceneAssetUrl?:string;mapAssetUrl?:string;labels:Labels}){
 const [failedAssets,setFailedAssets]=useState<string[]>([]);
 const sceneImage=sceneAssetUrl&&!failedAssets.includes(sceneAssetUrl)?sceneAssetUrl:undefined;
 const image=sceneImage??(mapAssetUrl&&!failedAssets.includes(mapAssetUrl)?mapAssetUrl:undefined);
 return <section className={`sceneStagePresentation${image?'':' sceneStageWithoutArt'}`} aria-label={labels.scene}>
  {image&&<img key={image} className="sceneStageArtwork" src={image} alt="" onError={()=>setFailedAssets(previous=>[...previous,image])}/>}
  <div className="sceneStageSummary"><h3>{title}</h3><p>{summary||labels.summary}</p>{!sceneImage&&<small>{labels.unavailable}</small>}</div>
 </section>;
}

export function sceneArtwork(sceneId:string|undefined,sceneMedia:Record<string,string>|undefined,background:string|undefined):string|undefined{return sceneId&&sceneMedia?sceneMedia[sceneId]:background}
