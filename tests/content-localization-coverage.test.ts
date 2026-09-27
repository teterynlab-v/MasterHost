import {describe,it,expect} from 'vitest';
import {readFile} from 'node:fs/promises';
// @ts-expect-error source inventory is also runnable without a TS build
import {officialContentInventory} from '../scripts/content-localization-inventory.mjs';
const locales=['ru','es','ja','zh-CN','ko'];
describe('official universe narrative localization completeness',()=>{
 it('preserves interpolation fields in localized shared captions',async()=>{
  for(const locale of locales){const dictionary=JSON.parse(await readFile(`content-locales/_ui/${locale}.json`,'utf8')) as Record<string,string>;
   for(const [source,target] of Object.entries(dictionary))expect(target.match(/\{\w+\}/g)?.sort()??[],`${locale}: ${source}`).toEqual(source.match(/\{\w+\}/g)?.sort()??[]);
  }
 });
 it('has every authored catalogue, Pack and asset string in every supported target language',async()=>{
  const inventory=await officialContentInventory(),missing:string[]=[];
  for(const [universe,sources] of Object.entries(inventory) as [string,string[]][]){
   for(const locale of locales){
    let dictionary:Record<string,string>={};try{dictionary=JSON.parse(await readFile(`content-locales/${universe}/${locale}.json`,'utf8'));}catch{}
    for(const source of sources){const target=dictionary[source];if(!target?.trim())missing.push(`${universe}/${locale}: ${source}`);else if(source.length>60&&target===source)missing.push(`${universe}/${locale}: unchanged narrative ${source}`);}
   }
  }
  expect(missing.length,missing.slice(0,12).join('\n')).toBe(0);
 });
});
