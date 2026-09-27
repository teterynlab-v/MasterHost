import type {ContentPack} from './i18n/content.js';
import {authoredValue} from './i18n/content.js';
import {useContentI18n} from './i18n/content-react.js';
import React from "react";
import { LanguageSwitcher, useI18n } from "./i18n/react.js";

type Entity = { id?:string; kind: string; values?: Record<string,{value?:unknown;source?:string}>; tags?: string[] };
type World = { id:string; packId?:string; name:string; entities?:Entity[] };

export function gameOverview(world:World,c:(source:unknown)=>string=String){
 const entities=world.entities??[],counts=Object.entries(entities.reduce<Record<string,number>>((all,entity)=>({...all,[entity.kind]:(all[entity.kind]??0)+1}),{})).sort((a,b)=>b[1]-a[1]),kit=entities.find(entity=>entity.kind==="campaign-kit"),openingId=kit?.values?.openingSceneId?.value,opening=entities.find(entity=>typeof openingId==="string"&&(entity.id===openingId||entity.values?.deepId?.value===openingId))??entities.find(entity=>entity.kind==="scene")??entities.find(entity=>entity.tags?.includes("campaign-hook")||/(event|scene)/i.test(entity.kind));
 return{counts,opening:authoredValue(opening?.values?.name,c),kit:authoredValue(kit?.values?.name,c),total:entities.length};
}
export function GameHub({world,pack,onStart,onEdit,onBack}:{world:World;pack?:ContentPack;onStart:()=>void;onEdit:()=>void;onBack:()=>void}){
 const{c}=useContentI18n(pack??(world.packId?{manifest:{id:world.packId}}:undefined)),{t}=useI18n(),overview=gameOverview(world,c);
 return <main className="gameHub">
  <header className="productHeader compact"><div><p className="eyebrow">{t("game.ready")}</p><h1>{world.name}</h1><p>{t("game.summary")}</p></div><LanguageSwitcher/></header>
  <section className="gameHubHero"><div><span className="homeIcon">♛</span><h2>{t("game.start")}</h2><p>{t("setup.help")}</p></div><button onClick={onStart}>{t("game.start")}</button></section>
  <div className="gameHubGrid">
   <section><h2>{t("game.prepared")}</h2>{overview.kit&&<article><small>{t("game.contents")}</small><h3>{overview.kit}</h3></article>}{overview.opening&&<article><small>{t("game.opening")}</small><h3>{overview.opening}</h3></article>}<p>{overview.counts.slice(0,8).map(([kind,count])=><span className="tag" key={kind}>{c(kind)} · {count}</span>)}</p><strong>{t("game.contents")} · {overview.total}</strong></section>
   <section><h2>{t("game.how")}</h2><ol className="runSteps"><li>{t("game.step1")}</li><li>{t("game.step2")}</li><li>{t("game.step3")}</li></ol></section>
  </div>
  <div className="gameHubActions"><button className="secondary" onClick={onBack}>{t("game.back")}</button><button className="secondary" onClick={onEdit}>{t("game.configure")}</button></div>
 </main>;
}
