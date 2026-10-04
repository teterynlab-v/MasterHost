import React,{useState} from 'react';
import {useI18n} from './i18n/react.js';
import {buildFeedbackReport} from './feedback-report.js';
import type {Locale} from './i18n/catalog.js';
const copy:Record<Locale,{title:string;help:string;label:string;save:string;close:string}>={
 en:{title:'Report a problem',help:'Describe what happened and what you expected. Do not include passwords, invitation codes or private notes. This downloads a report; nothing is sent automatically. Review it before sharing.',label:'Description',save:'Download report',close:'Close'},
 ru:{title:'Сообщить о проблеме',help:'Опишите, что произошло и чего вы ожидали. Не включайте пароли, коды приглашений и приватные заметки. Отчёт скачивается, ничего не отправляется автоматически. Проверьте его перед передачей.',label:'Описание',save:'Скачать отчёт',close:'Закрыть'},
 es:{title:'Informar de un problema',help:'Describe lo ocurrido y lo esperado. No incluyas contraseñas, códigos ni notas privadas. Se descarga un informe; no se envía automáticamente. Revísalo antes de compartirlo.',label:'Descripción',save:'Descargar informe',close:'Cerrar'},
 ja:{title:'問題を報告',help:'起きたことと期待した動作を説明してください。パスワード、招待コード、非公開メモを含めないでください。報告はダウンロードされ、自動送信されません。共有前に確認してください。',label:'説明',save:'報告をダウンロード',close:'閉じる'},
 'zh-CN':{title:'报告问题',help:'描述实际情况和预期结果。请勿包含密码、邀请码或私人笔记。报告仅下载，不会自动发送。分享前请检查。',label:'描述',save:'下载报告',close:'关闭'},
 ko:{title:'문제 보고',help:'발생한 상황과 기대한 결과를 설명하세요. 비밀번호, 초대 코드, 비공개 메모를 포함하지 마세요. 보고서는 다운로드되며 자동 전송되지 않습니다. 공유 전에 확인하세요.',label:'설명',save:'보고서 다운로드',close:'닫기'},
};
export function Feedback(){const {locale}=useI18n(),c=copy[locale],[open,setOpen]=useState(false),[description,setDescription]=useState('');
 function save(){const report=buildFeedbackReport({description,locale,hash:location.hash,version:(import.meta as ImportMeta & {env?:Record<string,string>}).env?.VITE_RELEASE_VERSION}),blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='masterhost-feedback.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 return <aside className="feedback"><button className="secondary" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="feedback-form">{c.title}</button>{open&&<section id="feedback-form" aria-label={c.title}><p>{c.help}</p><label htmlFor="feedback-description">{c.label}</label><textarea id="feedback-description" maxLength={4000} value={description} onChange={e=>setDescription(e.target.value)}/><div className="actions"><button disabled={!description.trim()} onClick={save}>{c.save}</button><button className="secondary" onClick={()=>setOpen(false)}>{c.close}</button></div></section>}</aside>
}
