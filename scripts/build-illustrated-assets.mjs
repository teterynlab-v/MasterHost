import fs from 'node:fs';
import {createRequire} from 'node:module';
const {parse}=createRequire(new URL('../packages/worldpack-sdk/package.json',import.meta.url))('yaml');
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const universeId=process.argv[2];
const inventory=JSON.parse(fs.readFileSync('artwork/manifest.json'));
const entries=inventory.entries.filter(entry=>entry.universeId===universeId);
if(entries.length!==151||entries.some(entry=>entry.status!=='generated'))throw Error(`All 151 source images must exist for ${universeId}`);
const basePack=parse(fs.readFileSync(`worldpacks/${universeId}/pack.yaml`,'utf8'));
const profile=JSON.parse(fs.readFileSync(`worldpacks/${universeId}/universe.yaml`));
const sourceFiles=fs.readdirSync('game-assets/library').filter(name=>name.endsWith('.json')).map(name=>({name,asset:JSON.parse(fs.readFileSync(`game-assets/library/${name}`))})).filter(({asset})=>asset.compatibility.basePackIds.includes(`masterhost.${universeId}`)&&asset.preview.highlights.includes('Deep Universe Standard v1'));
if(sourceFiles.length!==9)throw Error('Expected exactly nine retained source assets');
const sourceVersions=sourceFiles.map(({asset})=>asset.version.split('.').map(Number));
const major=Math.max(...sourceVersions.map(parts=>parts[0]));
const minor=Math.max(...sourceVersions.filter(parts=>parts[0]===major).map(parts=>parts[1]))+1;
const priorIntegrationPath=`artwork/${universeId}-integration.json`;
const retainedVersion=fs.existsSync(priorIntegrationPath)?JSON.parse(fs.readFileSync(priorIntegrationPath)).version:undefined;
const version=process.argv[3]??retainedVersion??`${major}.${minor}.0`,familyTag=id=>`illustrated.${universeId}.${id}`;
const writeImmutable=(path,bytes)=>{if(fs.existsSync(path)){if(!fs.readFileSync(path).equals(Buffer.from(bytes)))throw Error(`Published artwork version is immutable: ${path}`);}else fs.writeFileSync(path,bytes);};
const roleFor={factions:'card',locations:'location',npcs:'portrait',adversaries:'token',items:'item',events:'background',scenes:'background',archetypes:'portrait',progressionPaths:'card',visualThemes:'map'};
const media=[];
for(const entry of entries){
 const source=fs.readFileSync(entry.output);if(createHash('sha256').update(source).digest('hex')!==entry.checksum)throw Error(`Source checksum mismatch ${entry.output}`);
 const name=`${universeId}/illustrated-${version}/${entry.objectId}.webp`,path=`media/${name}`;
 fs.mkdirSync(`game-assets/library/media/${universeId}/illustrated-${version}`,{recursive:true});
 const candidate=`game-assets/library/${path}.candidate`;
 execFileSync(process.env.CWEBP_PATH??'cwebp',['-quiet','-q','85','-resize','1024','0','-size','48000',entry.output,'-o',candidate]);
 const bytes=fs.readFileSync(candidate);fs.unlinkSync(candidate);
 if(bytes.length>80000)throw Error(`Image exceeds portable media budget: ${name}`);
 writeImmutable(`game-assets/library/${path}`,bytes);
 media.push({name,path,role:roleFor[entry.kind],mediaType:'image/webp',checksum:createHash('sha256').update(bytes).digest('hex'),size:bytes.length});
}
if(media.reduce((total,value)=>total+value.size,0)>8500000)throw Error('Illustrated collection exceeds portable Pack budget');
const mediaById=new Map(entries.map((entry,index)=>[entry.objectId,media[index]]));
const image=id=>`assets/${mediaById.get(id).name}`;
const families=Object.fromEntries(entries.map(entry=>[familyTag(entry.objectId),{[roleFor[entry.kind]]:image(entry.objectId),card:image(entry.objectId)}]));
const sourceIds=new Set(sourceFiles.map(({asset})=>asset.id));
for(const {name,asset} of sourceFiles){
 asset.version=asset.fragment.version=version;
 asset.name=asset.fragment.name=`${asset.name} — Illustrated`;
 asset.preview.highlights=asset.preview.highlights.filter(value=>value!=='Deep Universe Standard v1').concat('Illustrated Universe v1');
 asset.dependencies=asset.dependencies.map(dependency=>sourceIds.has(dependency.id)?{...dependency,version}:dependency);
 for(const patch of asset.fragment.patches){const id=patch.value?.values?.deepId?.value;if(id&&mediaById.has(id))patch.value.tags=[...patch.value.tags??[],familyTag(id)];}
 if(asset.type==='characters'){
  const archetypes=entries.filter(entry=>entry.kind==='archetypes');
  const steps=basePack.characterCreation.steps;
  const stepIndex=steps.findIndex(step=>step.fields.some(field=>field.id==='portrait'&&field.type==='asset'));
  if(stepIndex<0)throw Error('Expected an existing Pack portrait selector');
  const fieldIndex=steps[stepIndex].fields.findIndex(field=>field.id==='portrait');
  const portrait=steps[stepIndex].fields[fieldIndex];
  asset.fragment.patches.push({op:'append',path:`/content/characterCreation/steps/${stepIndex}/fields/${fieldIndex}/options`,value:archetypes.map(entry=>({value:entry.objectId,label:entry.name}))});
  asset.fragment.patches.push({op:'append',path:'/content/characterCreation/starting/assets',value:[{id:'portrait',value:image(archetypes[0].objectId),when:{field:'portrait',equals:portrait.default}},...archetypes.map(entry=>({id:'portrait',value:image(entry.objectId),when:{field:'portrait',equals:entry.objectId}}))]});
 }
 if(asset.type==='visuals'){
  asset.media=media;asset.counts.media=media.length;
  const artId=`illustrated-${universeId}`;
  asset.fragment.defaultArtSet=artId;
  asset.fragment.patches=[{op:'set',path:`/artSets/${artId}`,value:{id:artId,name:`Illustrated ${universeId}`,description:'Individual generated illustrations for every authored content object',defaults:{background:image('scenes.1'),card:image('scenes.1'),map:image('visualThemes.1'),portrait:image('archetypes.1'),token:image('adversaries.1'),item:image('items.1'),location:image('locations.1')},families}}];
 }
 writeImmutable(`game-assets/library/${name.replace('.json',`-illustrated-${version}.json`)}`,JSON.stringify(asset,null,2)+'\n');
}
fs.writeFileSync(`artwork/${universeId}-integration.json`,JSON.stringify({universeId,version,sourcePack:profile.id,sourceImages:151,runtimeImages:media.length,runtimeBytes:media.reduce((n,m)=>n+m.size,0),status:'assembled; runtime/browser acceptance pending'},null,2)+'\n');
console.log(`Assembled ${universeId}: nine versioned assets, 151 distinct WebP images; retained source assets unchanged.`);
