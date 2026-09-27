import {resolve} from "node:path";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {describe,it,expect} from "vitest";
import {loadUniverseCatalog,loadWorldPack,worldPackDocumentFromLoaded,resolveUniverseCatalog,toLoadedWorldPack} from "@masterhost/worldpack-sdk";
import {loadGameAssetRegistry,reviewQuickGameSelection,gameAssetFragments,composeGameDescriptor,buildDescriptor,type GameDescriptorFragment} from "@masterhost/descriptor";
import {compileSatisfying} from "@masterhost/world-compiler";
import {playTodayAssets,quickBuilderFlow} from "../apps/web/src/quick-game-builder.js";
import {filterUniverseCatalog,attemptUniversePlay} from "../apps/web/src/universe-catalog.js";
const options={terminology:{world:"World",character:"Character",gameMaster:"Game Master"},theme:{primary:"#d9b45b",accent:"#739b68",background:"#101713"}};
describe("M30 entire official collection",()=>{
 it("keeps activation failures visible instead of swallowing a failed Play Today click",async()=>{
  const value={universeId:"test",universeName:"Test",basePack:{id:"test",version:"1"},patternId:"p",campaignKitId:"k",visualThemeId:"v"};
  expect(await attemptUniversePlay(value,async()=>{throw Error("Realm Admin role required")})).toBe("Realm Admin role required");expect(await attemptUniversePlay(value,async()=>{})).toBeUndefined();
 });
 it("offers twelve exact ready universes and compiles all 36 Kits through generic Quick/Advanced contracts",async()=>{
  const catalog=await loadUniverseCatalog(),assets=await loadGameAssetRegistry(resolve("game-assets/library")),documents=[];
  for(const entry of catalog){
   const base=await worldPackDocumentFromLoaded(await loadWorldPack(resolve("worldpacks",entry.id)),options);documents.push(base);
   expect(base.manifest).toMatchObject(entry.targetPack);expect(base.universe?.complexity).toBe(entry.complexity);
   expect(base.universe?.recommendedPlayers).toEqual(entry.recommendedPlayers);expect(base.universe?.genres).toEqual(entry.genres);expect(base.universe?.tones).toEqual(entry.tones);
   const available=assets.filter(a=>a.compatibility.basePackIds.includes(base.manifest.id));
   expect(quickBuilderFlow(playTodayAssets(available))).toEqual([{kind:"name"},{kind:"decisions"},{kind:"review"}]);
   const selected=assets.filter(a=>a.compatibility.basePackIds.includes(base.manifest.id)&&a.preview.highlights.includes("Deep Universe Standard v1"));
   const review=reviewQuickGameSelection(assets,base.manifest.id,selected.map(a=>({id:a.id,version:a.version})));expect(review.ready,entry.id+JSON.stringify(review.diagnostics)).toBe(true);
   expect(review.selected).toHaveLength(9);
   const composed=composeGameDescriptor({projectId:`collection-${entry.id}`,revision:1,name:entry.name,base,fragments:gameAssetFragments(assets),selections:review.orderedSelections.map(s=>({fragmentId:s.id,version:s.version,parameters:{}}))});expect(composed.report.valid,JSON.stringify(composed.report)).toBe(true);
   for(const kit of base.universe!.campaignKits){
    const pattern=kit.patternIds[0],theme=base.universe!.content.visualThemes.find(t=>t.patternIds.includes(pattern))!;
    const decisions={"world.pattern":pattern,"world.campaignKit":kit.id,"world.visualTheme":theme.id};
    const descriptor=buildDescriptor({packId:composed.document.manifest.id,packVersion:composed.document.manifest.version,seed:kit.id,choices:Object.entries(decisions).map(([path,value])=>({path,value:{mode:"explicit" as const,value}}))});
    const compiled=compileSatisfying({realmId:"00000000-0000-4000-a000-000000000030",pack:toLoadedWorldPack(composed.document),descriptor,seed:kit.id});expect(compiled.constraints.every(c=>c.passed)).toBe(true);expect(compiled.world.entities.filter(e=>e.kind==="scene")).toHaveLength(6);
   }
  }
  const ready=resolveUniverseCatalog(catalog,documents);expect(ready.every(e=>e.availability==="ready")).toBe(true);
  expect(filterUniverseCatalog(ready,{query:"",genre:"science fiction",tone:"",complexity:""}).some(e=>e.id==="space-opera")).toBe(true);
  for(const entry of ready){for(const [field,values]of [["genre",entry.genres],["tone",entry.tones],["complexity",[entry.complexity]]] as const)for(const value of values)expect(filterUniverseCatalog(ready,{query:"",genre:"",tone:"",complexity:"",[field]:value}).some(e=>e.id===entry.id)).toBe(true)}
 },30000);
 it("retains byte-identical original packs while publishing corrected new exact patch versions",async()=>{
  const retained=JSON.parse(await readFile("scripts/content/retained-v1-checksums.json","utf8"));
  for(const file of retained.files)expect(createHash("sha256").update(await readFile(file.path)).digest("hex")).toBe(file.sha256);
  for(const slug of ["mythic-antiquity","weird-west","urban-fantasy"]){
   const current=await loadWorldPack(resolve("worldpacks",slug));expect(current.manifest.version).toBe("1.0.1");expect(current.content.actorTemplates?.contact.label).not.toBe("Elara the Bold");expect(current.content.actorTemplates?.elite.label).not.toBe("Wyvern");
  }
 });
 it("allows explicitly independent mixed fragments and rejects missing requirements, conflicting writes and foreign Quick assets",async()=>{
  const base=await worldPackDocumentFromLoaded(await loadWorldPack(resolve("worldpacks/mecha-kaiju")),options);
  const fragment=(id:string,name:string):GameDescriptorFragment=>({id,version:"1.0.0",name,provides:[`location:${id}`],requires:[],conflicts:[],parameters:{},patches:[{op:"set",path:`/content/templates/${id}`,value:{kind:"location",values:{name:{value:name}}}},{op:"merge",path:"/content/templates/world.root/components",value:{[id]:{template:id}}}]});
  const ruins=fragment("shared-ruins","Bronze Signal Ruins"),bay=fragment("shared-bay","Neutral Frame Bay");
  const compose=(fragments:GameDescriptorFragment[])=>composeGameDescriptor({projectId:"mixed-independent",revision:1,name:"Mixed Frontier",base,fragments,selections:fragments.map(f=>({fragmentId:f.id,version:f.version,parameters:{}}))});
  expect(compose([ruins,bay]).report.valid).toBe(true);
  expect(compose([ruins,{...bay,requires:["setting:absent"]}]).report.valid).toBe(false);
  expect(compose([ruins,{...bay,patches:ruins.patches}]).report.diagnostics.some(d=>d.code==="write-conflict")).toBe(true);
  const assets=await loadGameAssetRegistry(resolve("game-assets/library"));const foreign=assets.find(a=>a.id==="masterhost.asset.myth.rules")!;expect(reviewQuickGameSelection(assets,base.manifest.id,[{id:foreign.id,version:foreign.version}]).diagnostics.some(d=>d.code==="incompatible-pack")).toBe(true);
 });
});
