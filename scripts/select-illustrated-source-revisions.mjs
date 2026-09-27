import fs from 'node:fs';
import {createHash} from 'node:crypto';
const queuePath=process.argv[2];
if(!queuePath)throw Error('Revision queue JSON required');
const inventory=JSON.parse(fs.readFileSync('artwork/manifest.json'));
const known=new Set(inventory.entries.map(e=>`${e.universeId}/${e.objectId}`));
const revisions=JSON.parse(fs.readFileSync('artwork/source-revisions.json'));
const overrides=JSON.parse(fs.readFileSync('artwork/generation-overrides.json'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
let selected=0;
for(const job of JSON.parse(fs.readFileSync(queuePath))){
 const key=`${job.universeId}/${job.objectId}`;
 if(!known.has(key)||!job.output.startsWith(`artwork/generated/${job.universeId}/`)||job.output.includes('..')||!job.output.endsWith('.png'))throw Error(`Invalid revision target: ${key}`);
 if(!fs.existsSync(job.output))continue;
 const bytes=fs.readFileSync(job.output);
 if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error(`Invalid revision PNG: ${key}`);
 revisions.selections[key]={output:job.output,checksum:hash(bytes),original:job.original,originalChecksum:hash(fs.readFileSync(job.original)),reason:'Generated a contemporary urban-fantasy replacement with the built-in image tool; first source retained. Individual art review remains separate.'};
 overrides.prompts[key]=job.generationPrompt;
 selected++;
}
for(const [file,data]of [['artwork/source-revisions.json',revisions],['artwork/generation-overrides.json',overrides]]){
 const temporary=`${file}.${process.pid}.tmp`;
 fs.writeFileSync(temporary,JSON.stringify(data,null,2)+'\n');
 fs.renameSync(temporary,file);
}
console.log(`Selected ${selected} retained-source revisions; visual approval remains separate.`);
