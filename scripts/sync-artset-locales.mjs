// Official Art Set captions use the same authored universe translations; IDs and paths stay canonical.
import {readFile,writeFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile(new URL('../universe-catalog/catalog.json',import.meta.url),'utf8'));
for(const entry of catalog)for(const locale of ['ru','es','ja','zh-CN','ko']){
 const file=new URL(`../content-locales/${entry.id}/${locale}.json`,import.meta.url);
 const dictionary=JSON.parse(await readFile(file,'utf8')),common=JSON.parse(await readFile(new URL(`../content-locales/_ui/${locale}.json`,import.meta.url),'utf8'));
 if(!dictionary[entry.name])throw Error(`Missing translated universe title: ${entry.id}/${locale}`);
 dictionary[`${entry.name} Standard`]=`${common.Standard} · ${dictionary[entry.name]}`;
 dictionary[`Official ${entry.name} visual language.`]=`${common['Official visual language']} · ${dictionary[entry.name]}`;
 await writeFile(file,JSON.stringify(dictionary,null,2)+'\n');
}
