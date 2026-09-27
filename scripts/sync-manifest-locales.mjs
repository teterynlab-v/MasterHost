// Restore authored current and retained official Pack summaries after corpus helper reconstruction.
import {readFile,writeFile} from 'node:fs/promises';
const additions=JSON.parse(await readFile(new URL('../content-locales/sources/manifest-translations.json',import.meta.url),'utf8'));
for(const [universe,locales] of Object.entries(additions))for(const [locale,values] of Object.entries(locales)){
 const file=new URL(`../content-locales/${universe}/${locale}.json`,import.meta.url);
 const dictionary=JSON.parse(await readFile(file,'utf8'));
 await writeFile(file,JSON.stringify({...dictionary,...values},null,2)+'\n');
}
