import React from "react";
import { LanguageSwitcher, useI18n } from "./i18n/react.js";

type Entity = { kind: string; values?: Record<string,{value?:unknown}>; tags?: string[] };
type World = { id:string; name:string; entities?:Entity[] };
const label = (entity:Entity|undefined) => String(entity?.values?.name?.value ?? "");

export function gameOverview(world:World){
 const entities=world.entities??[],counts=Object.entries(entities.reduce<Record<string,number>>((all,entity)=>({...all,[entity.kind]:(all[entity.kind]??0)+1}),{})).sort((a,b)=>b[1]-a[1]),opening=entities.find(entity=>entity.tags?.includes("campaign-hook")||/(event|scene)/i.test(entity.kind)),kit=entities.find(entity=>entity.kind==="campaign-kit");
 return{counts,opening:label(opening),kit:label(kit),total:entities.length};
}
export function GameHub({world,onStart,onEdit,onBack}:{world:World;onStart:()=>void;onEdit:()=>void;onBack:()=>void}){
 const{t}=useI18n(),overview=gameOverview(world);
 return <main className="gameHub">
  <header className="productHeader compact"><div><p className="eyebrow">{t("game.ready")}</p><h1>{world.name}</h1><p>{t("game.summary")}</p></div><LanguageSwitcher/></header>
  <section className="gameHubHero"><div><span className="homeIcon">♛</span><h2>{t("game.start")}</h2><p>{t("setup.help")}</p></div><button onClick={onStart}>{t("game.start")}</button></section>
  <div className="gameHubGrid">
   <section><h2>{t("game.prepared")}</h2>{overview.kit&&<article><small>{t("game.contents")}</small><h3>{overview.kit}</h3></article>}{overview.opening&&<article><small>{t("game.opening")}</small><h3>{overview.opening}</h3></article>}<p>{overview.counts.slice(0,8).map(([kind,count])=><span className="tag" key={kind}>{count} {kind}</span>)}</p><strong>{overview.total} {t("game.contents").toLowerCase()}</strong></section>
   <section><h2>{t("game.how")}</h2><ol className="runSteps"><li>{t("game.step1")}</li><li>{t("game.step2")}</li><li>{t("game.step3")}</li></ol></section>
  </div>
  <div className="gameHubActions"><button className="secondary" onClick={onBack}>{t("game.back")}</button><button className="secondary" onClick={onEdit}>{t("game.configure")}</button></div>
 </main>;
}
