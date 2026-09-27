import {readFile,readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const require=createRequire(path.join(root,'packages/worldpack-sdk/package.json'));
const yaml=require('yaml');
const fields=new Set(['name','description','summary','label','title','help','placeholder','hint','prompt','alt']);
function collect(value,strings,key=''){
 if(typeof value==='string'){
  if((fields.has(key)||['gmGuidance','gameLoop','highlights'].includes(key))&&!value.startsWith('assets/')&&!value.startsWith('media/')&&!/\.(svg|webp|png|jpe?g)$/.test(value))strings.add(value);
 }else if(Array.isArray(value))value.forEach(item=>collect(item,strings,key));
 else if(value&&typeof value==='object')for(const [child,item] of Object.entries(value))collect(item,strings,fields.has(key)&&child==='value'?key:child);
}
export async function officialContentInventory(){
 const catalog=JSON.parse(await readFile(path.join(root,'universe-catalog/catalog.json'),'utf8'));
 const assets=await Promise.all((await readdir(path.join(root,'game-assets/library'))).filter(file=>file.endsWith('.json')).map(async file=>JSON.parse(await readFile(path.join(root,'game-assets/library',file),'utf8'))));
 const manifests=await Promise.all((await readdir(path.join(root,'worldpacks'))).map(async directory=>{try{return yaml.parse(await readFile(path.join(root,'worldpacks',directory,'manifest.yaml'),'utf8'));}catch{return null;}}));
 const result={};
 for(const entry of catalog){
  const dir=path.join(root,'worldpacks',entry.id),pack=yaml.parse(await readFile(path.join(dir,'pack.yaml'),'utf8'));
  const strings=new Set();collect(entry,strings);for(const manifest of manifests)if(manifest?.id===`masterhost.${entry.id}`)collect(manifest,strings);for(const file of await readdir(path.join(dir,'artsets')))if(/\.ya?ml$/.test(file))collect(yaml.parse(await readFile(path.join(dir,'artsets',file),'utf8')),strings);collect(JSON.parse(await readFile(path.join(dir,'universe.yaml'),'utf8')),strings);collect(pack,strings);
  for(const [key,generator] of Object.entries(pack.generators??{}))if(/names$/.test(key))for(const value of generator.values??[])if(typeof value==='string')strings.add(value);
  for(const asset of assets)if(asset.compatibility?.basePackIds?.includes(`masterhost.${entry.id}`))collect(asset,strings);
  result[entry.id]=[...strings].sort();
 }
 return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(await officialContentInventory(),null,2));
