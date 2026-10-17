import React,{useCallback,useRef,useState} from 'react';
import {AuthenticatedImage} from './authenticated-image.js';
import {useI18n} from './i18n/react.js';
import {realmHeaders} from './realm.js';
import {notebookCopy,notebookDraftCopy} from './private-notebook-copy.js';
import './private-notebook.css';

const API=(import.meta as any).env?.VITE_API_URL??'http://localhost:8080/api';
type NoteImage={checksum:string;mediaType:string;size:number;name:string};
type Note={id:string;text:string;image?:NoteImage};
type NotebookTable={revision:number;privateNotes?:string[];privateNoteEntries?:Note[]};
type NoteEditor={id:string;revision:number;originalText:string;originalChecksum?:string};
const notebookEntries=(table:NotebookTable):Note[]=>table.privateNoteEntries??table.privateNotes?.map((text,index)=>({id:`legacy-${index}`,text}))??[];
export function noteSaveRevision(editor:NoteEditor|undefined,table:NotebookTable):number{
 if(editor){const current=notebookEntries(table).find(note=>note.id===editor.id);if(!current||current.text!==editor.originalText||current.image?.checksum!==editor.originalChecksum)throw Error('NOTE_CHANGED')}
 return table.revision;
}
export type NoteImageUpload={name:string;mediaType:string;data:string};
export async function encodeNoteImage(file:File):Promise<NoteImageUpload>{
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('NOTE_IMAGE_TYPE');
 if(!file.size||file.size>2_000_000)throw Error('NOTE_IMAGE_SIZE');
 const bytes=new Uint8Array(await file.arrayBuffer());let binary='';
 for(let offset=0;offset<bytes.length;offset+=8192)binary+=String.fromCharCode(...bytes.subarray(offset,offset+8192));
 return{name:file.name.slice(0,180),mediaType:file.type,data:btoa(binary)};
}

export function PrivateNotebook({sessionId,token,table,send}:{sessionId:string;token:string;table?:NotebookTable;send:(path:string,method:string,body:any)=>Promise<any>}){
 const{locale}=useI18n(),copy={...notebookCopy[locale],...notebookDraftCopy[locale]};
 const[text,setText]=useState(''),[editing,setEditing]=useState<NoteEditor>(),[image,setImage]=useState<NoteImageUpload>(),[removeImage,setRemoveImage]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[deleting,setDeleting]=useState<{id:string;revision:number}>(),[fileKey,setFileKey]=useState(0),[pendingEdit,setPendingEdit]=useState<Note>(),[conflicted,setConflicted]=useState(false);
 const notes:Note[]=table?notebookEntries(table):[];
 const [readingImage,setReadingImage]=useState(false),imageSelection=useRef(0);
 const current=notes.find(note=>note.id===editing?.id),existingImage=current?.image&&!removeImage?current.image:undefined;
 const base=`/sessions/${encodeURIComponent(sessionId)}/table/notes`;
 const requestMedia=useCallback(async(path:string)=>{const response=await fetch(`${API}${path}`,{headers:realmHeaders({authorization:`Bearer ${token}`})});if(!response.ok)throw Error(`HTTP ${response.status}`);return response.blob()},[token]);
 const clear=()=>{imageSelection.current++;setReadingImage(false);setText('');setEditing(undefined);setImage(undefined);setRemoveImage(false);setError('');setConflicted(false);setPendingEdit(undefined);setFileKey(key=>key+1)};
 const openEdit=(note:Note)=>{clear();setText(note.text);setEditing({id:note.id,revision:table!.revision,originalText:note.text,originalChecksum:note.image?.checksum});setDeleting(undefined)};
 const edit=(note:Note)=>{if(editing?.id===note.id)return;if(readingImage||image||removeImage||text!==(editing?.originalText??''))setPendingEdit(note);else openEdit(note)};
 const save=async()=>{
  if(!table||busy||readingImage)return;setBusy(true);setError('');
  try{const result=await send(editing?`${base}/${encodeURIComponent(editing.id)}`:base,editing?'PATCH':'POST',{expectedRevision:noteSaveRevision(editing,table),text:text.trim(),...(image?{image}:removeImage?{image:null}:{})});if(result!==undefined)clear();else setError(copy.failed)}catch(reason){if(reason instanceof Error&&reason.message==='NOTE_CHANGED'){setConflicted(true);setError(copy.conflict)}else setError(reason instanceof Error?reason.message:copy.failed)}finally{setBusy(false)}
 };
 const remove=async()=>{
  if(!deleting||busy)return;setBusy(true);setError('');
  try{const result=await send(`${base}/${encodeURIComponent(deleting.id)}`,'DELETE',{expectedRevision:deleting.revision});if(result!==undefined){if(editing?.id===deleting.id)clear();setDeleting(undefined)}else setError(copy.failed)}catch(reason){setError(reason instanceof Error?reason.message:copy.failed)}finally{setBusy(false)}
 };
 return <section className="privateNotebook" aria-label={copy.title}>
  <h3>{copy.title}</h3>
  <div className="notebookList">{notes.length?notes.map(note=><div className="notebookEntry" key={note.id}>
   {note.text&&<p>{note.text}</p>}
   {note.image&&<AuthenticatedImage className="notebookImage" requestMedia={requestMedia} path={`${base}/${encodeURIComponent(note.id)}/image?checksum=${note.image.checksum}`} alt={copy.image} onError={setError}/>}
   <div className="notebookActions"><button type="button" className="secondary" disabled={busy} onClick={()=>edit(note)}>{copy.edit}</button><button type="button" className="danger secondary" disabled={busy} onClick={()=>{setDeleting({id:note.id,revision:table!.revision});setError('')}}>{copy.remove}</button></div>
   {deleting?.id===note.id&&<div className="notebookConfirm" role="group" aria-label={copy.deleteQuestion}><p>{copy.deleteQuestion}</p><button type="button" className="danger" disabled={busy} onClick={()=>void remove()}>{copy.remove}</button><button type="button" className="secondary" disabled={busy} onClick={()=>setDeleting(undefined)}>{copy.cancel}</button></div>}
  </div>):<p className="muted">{copy.empty}</p>}</div>
  {pendingEdit&&<div className="notebookConfirm" role="group" aria-label={copy.switchDraft}><p>{copy.switchDraft}</p><button type="button" className="secondary" onClick={()=>setPendingEdit(undefined)}>{copy.stay}</button><button type="button" className="danger" onClick={()=>openEdit(pendingEdit)}>{copy.discard}</button></div>}
  <div className="notebookEditor quickNote"><label><span>{copy.text}</span><textarea rows={3} maxLength={2000} value={text} disabled={busy} onChange={event=>setText(event.target.value)}/></label>
   {(image||existingImage)&&<div>{image?<img className="notebookImage" src={`data:${image.mediaType};base64,${image.data}`} alt={copy.image}/>:current?.image&&<AuthenticatedImage className="notebookImage" requestMedia={requestMedia} path={`${base}/${encodeURIComponent(current.id)}/image?checksum=${current.image.checksum}`} alt={copy.image} onError={setError}/>}<button type="button" className="secondary" disabled={busy} onClick={()=>{imageSelection.current++;setReadingImage(false);setImage(undefined);setRemoveImage(true);setFileKey(key=>key+1)}}>{copy.removeImage}</button></div>}
   <label><span>{copy.attach}</span><input key={fileKey} type="file" accept="image/png,image/jpeg,image/webp" disabled={busy||!table} onChange={event=>{const file=event.target.files?.[0];if(file){const selection=++imageSelection.current;setReadingImage(true);setError('');void encodeNoteImage(file).then(value=>{if(selection===imageSelection.current){setImage(value);setRemoveImage(false)}}).catch(reason=>{if(selection===imageSelection.current)setError(reason.message==='NOTE_IMAGE_TYPE'?copy.imageType:copy.imageSize)}).finally(()=>{if(selection===imageSelection.current)setReadingImage(false)})}}}/></label><small className="muted">{copy.limit}</small>
   <div className="notebookActions"><button type="button" disabled={busy||readingImage||!table||(!text.trim()&&!image&&!existingImage)} onClick={()=>void save()}>{busy?copy.busy:editing?copy.save:copy.add}</button>{editing&&<button type="button" className="secondary" disabled={busy} onClick={clear}>{copy.cancel}</button>}</div>
  </div>{error&&<p className="error" role="alert">{error}</p>}{conflicted&&current&&table&&<button type="button" className="secondary" onClick={()=>{setEditing({id:current.id,revision:table.revision,originalText:current.text,originalChecksum:current.image?.checksum});setConflicted(false);setError('')}}>{copy.rebase}</button>}
 </section>;
}
