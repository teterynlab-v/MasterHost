import type {FastifyInstance,FastifyRequest} from 'fastify';
import {randomUUID} from 'node:crypto';
import {mutateTablePrivateNote} from '@masterhost/game-runtime';
import type {TableState,TablePrivateNoteImage} from '@masterhost/game-runtime';
import {assetChecksum,validateWorldImage} from '@masterhost/persistence';
import type {TableNoteImageUpload} from '@masterhost/persistence';

type Dependencies={
 authorize:(req:FastifyRequest,sessionId:string)=>Promise<void>;
 session:(id:string)=>Promise<{state:string}|null>;
 update:(id:string,revision:number,mutate:(table:TableState)=>void,event:{type:string;payload:Record<string,unknown>},image?:TableNoteImageUpload)=>Promise<TableState>;
 image:(id:string,noteId:string)=>Promise<{data:Uint8Array;mediaType:string}|null>;
 notify:(id:string,table:TableState)=>Promise<void>;
};
const bad=(message:string)=>Object.assign(Error(message),{statusCode:400});
function readImage(value:unknown):TableNoteImageUpload|null|undefined{
 if(value===undefined||value===null)return value;
 if(typeof value!=='object')throw bad('invalid note image');
 const {name,mediaType,data}=value as Record<string,unknown>;
 if(typeof name!=='string'||!name.trim()||name.length>180||/[\x00-\x1f\x7f]/.test(name)||typeof mediaType!=='string'||typeof data!=='string'||data.length>2_666_668||!data.length||data.length%4!==0||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(data))throw bad('invalid note image');
 const bytes=Buffer.from(data,'base64');
 if(bytes.toString('base64')!==data)throw bad('invalid note image');
 try{validateWorldImage('note-image',mediaType,bytes)}catch{throw bad('unsupported or invalid note image (maximum 2000000 bytes)')}
 return {name,mediaType,data:bytes,size:bytes.length,checksum:assetChecksum(bytes)};
}
export async function registerTableNotes(app:FastifyInstance,deps:Dependencies){
 const write=async(req:any,kind:'add'|'edit'|'delete')=>{
  const id=req.params.id;await deps.authorize(req,id);
  const session=await deps.session(id);if(!session||!['lobby','live'].includes(session.state))throw Object.assign(Error('table state is immutable after Session completion'),{statusCode:409});
  const revision=req.body?.expectedRevision;if(!Number.isSafeInteger(revision)||revision<1)throw bad('valid table revision required');
  let text='';let upload:TableNoteImageUpload|null|undefined;
  if(kind!=='delete'){
   if(typeof req.body?.text!=='string'||req.body.text.trim().length>2000)throw bad('invalid private note');
   text=req.body.text.trim();upload=readImage(req.body.image);
  }
  const noteId=kind==='add'?randomUUID():req.params.noteId;
  const metadata:TablePrivateNoteImage|null|undefined=upload?{name:upload.name,mediaType:upload.mediaType,size:upload.size,checksum:upload.checksum}:upload;
  const table=await deps.update(id,revision,table=>mutateTablePrivateNote(table,kind==='delete'?{kind,id:noteId}:{kind,id:noteId,text,image:metadata}),{type:kind==='add'?'TablePrivateNoteRecorded':kind==='edit'?'TablePrivateNoteUpdated':'TablePrivateNoteDeleted',payload:{}},upload??undefined);
  await deps.notify(id,table);return table;
 };
 app.post('/api/sessions/:id/table/notes',{bodyLimit:3_000_000},req=>write(req,'add'));
 app.patch('/api/sessions/:id/table/notes/:noteId',{bodyLimit:3_000_000},req=>write(req,'edit'));
 app.delete('/api/sessions/:id/table/notes/:noteId',req=>write(req,'delete'));
 app.get<{Params:{id:string;noteId:string}}>('/api/sessions/:id/table/notes/:noteId/image',async(req,reply)=>{
  await deps.authorize(req,req.params.id);
  const image=await deps.image(req.params.id,req.params.noteId);if(!image)throw Object.assign(Error('private note image not found'),{statusCode:404});
  return reply.header('cache-control','private, no-store').header('x-content-type-options','nosniff').type(image.mediaType).send(Buffer.from(image.data));
 });
}
