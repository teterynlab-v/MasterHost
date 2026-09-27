import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe,it,expect} from "vitest";
import {CharacterChoices} from "./character-choice.js";
import {characterSheetTraits} from "./game.js";
import {I18nProvider} from "./i18n/react.js";
import {supportedLocales,translate} from "./i18n/catalog.js";
const schema={steps:[{fields:[{id:"calling",label:"Calling",type:"choice",options:[{value:"pilot",label:"Pilot"}]}]}],starting:{traits:[{id:"trained-pilot",when:{field:"calling",equals:"pilot"}}]}};
describe("M30 cross-game Character clarity",()=>{
 it("keeps selectable compatible cards first and other games in a closed disclosure",()=>{
  Object.defineProperty(globalThis,"location",{value:{search:"?lang=en"},configurable:true});
  Object.defineProperty(globalThis,"localStorage",{value:{getItem:()=>null,setItem:()=>{}},configurable:true});
  const html=renderToStaticMarkup(<I18nProvider><CharacterChoices schema={schema} characters={[{id:"old",displayName:"Old Mage",values:{calling:"mage"},compatibility:{compatible:false}},{id:"new",displayName:"New Pilot",values:{calling:"pilot"},compatibility:{compatible:true}}]} onChoose={()=>{}}/></I18nProvider>);
  expect(html.indexOf("New Pilot")).toBeLessThan(html.indexOf("Old Mage"));expect(html).toContain("Calling: Pilot");expect(html).toContain("<details>");expect(html.match(/<button/g)).toHaveLength(1);expect(html).not.toContain("calling: mage");
 });
 it("suppresses only traits already represented by the selected schema fields",()=>{
  expect(characterSheetTraits(schema,{calling:"pilot"},["trained-pilot","custom-oath"])).toEqual(["custom-oath"]);
  expect(characterSheetTraits(undefined,{calling:"pilot"},["trained-pilot"])).toEqual(["trained-pilot"]);
 });
 it("provides the cross-game disclosure in all six UI locales",()=>{for(const locale of supportedLocales){expect(translate(locale,"join.otherCharacters",{count:3})).not.toMatch(/join\.|\{count\}/);expect(translate(locale,"universe.contentFallback",{locale:"en"})).not.toMatch(/universe\.|\{locale\}/)}});
});
