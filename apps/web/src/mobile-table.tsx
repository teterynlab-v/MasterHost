import React,{useEffect,useRef} from 'react';
import {useI18n} from './i18n/react.js';
import type {Locale} from './i18n/catalog.js';
import type {MessageKey} from './i18n/catalog.js';
export type MobileTableTab='map'|'scenes'|'party'|'journal'|'character'|'actions';
export const mobileTableTabs={gm:['map','scenes','party','journal'],player:['map','character','actions','journal']} as const;
const labels:Record<MobileTableTab,MessageKey>={map:'player.map',scenes:'table.scenes',party:'player.group',journal:'player.journal',character:'player.character',actions:'player.abilities'};
export const mobileCopy:Record<Locale,{actions:string;feedback:string}>={en:{actions:'Actions',feedback:'Report a problem'},ru:{actions:'Действия',feedback:'Сообщить о проблеме'},es:{actions:'Acciones',feedback:'Informar de un problema'},ja:{actions:'行動',feedback:'問題を報告'},'zh-CN':{actions:'行动',feedback:'报告问题'},ko:{actions:'행동',feedback:'문제 보고'}};
const icons:Record<MobileTableTab,string>={map:'⌖',scenes:'▧',party:'♟',journal:'≡',character:'♙',actions:'✦'};
export function MobileTableNav({role,active,onSelect}:{role:'gm'|'player';active:MobileTableTab;onSelect:(tab:MobileTableTab)=>void}){const{t,locale}=useI18n();return <nav className="mobileTableNav" aria-label={t(role==='gm'?'gm.console':'player.tools')}>{mobileTableTabs[role].map(tab=><button key={tab} aria-current={active===tab?'page':undefined} onClick={()=>onSelect(tab)}><span aria-hidden="true">{icons[tab]}</span>{tab==='actions'?mobileCopy[locale].actions:t(labels[tab])}</button>)}</nav>}
/** Dialog stays mounted so rotation and closing preserve unsent controlled inputs. */
export function MobileTableMenu({open,onClose,children}:{open:boolean;onClose:()=>void;children:React.ReactNode}){const ref=useRef<HTMLDialogElement>(null),{t,locale}=useI18n();useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(open&&!dialog.open)dialog.showModal();else if(!open&&dialog.open)dialog.close()},[open]);return <dialog className="mobileTableMenu" ref={ref} onCancel={onClose} onClose={onClose} aria-label={t('common.tools')}><header><h2>{t('common.tools')}</h2><button className="secondary" aria-label={t('common.back')} onClick={onClose}>✕</button></header><div>{children}<button className="secondary" onClick={()=>{onClose();const feedback=document.querySelector<HTMLButtonElement>(".feedback>button");if(feedback?.getAttribute("aria-expanded")==="false")feedback.click()}}>{mobileCopy[locale].feedback}</button></div></dialog>}

export const participantRemovalCopy:Record<Locale,{title:string;help:string;cancel:string}>={
 en:{title:'Remove player?',help:'Their access to this session will be revoked. Their character stays in the campaign.',cancel:'Cancel'},
 ru:{title:'Удалить игрока?',help:'Доступ к этой сессии будет отозван. Персонаж останется в кампании.',cancel:'Отмена'},
 es:{title:'¿Eliminar al jugador?',help:'Se revocará su acceso a esta sesión. Su personaje permanecerá en la campaña.',cancel:'Cancelar'},
 ja:{title:'プレイヤーを削除しますか？',help:'このセッションへのアクセスが取り消されます。キャラクターはキャンペーンに残ります。',cancel:'キャンセル'},
 'zh-CN':{title:'移除玩家？',help:'该玩家将无法访问此会话。角色仍保留在战役中。',cancel:'取消'},
 ko:{title:'플레이어를 제거할까요?',help:'이 세션에 대한 접근 권한이 취소됩니다. 캐릭터는 캠페인에 남습니다.',cancel:'취소'},
};
export function ParticipantRemovalDialog({name,onCancel,onConfirm,disabled,busy,error}:{name:string|undefined;onCancel:()=>void;onConfirm:()=>void;disabled:boolean;busy:boolean;error?:string}){const{locale,t}=useI18n(),copy=participantRemovalCopy[locale],ref=useRef<HTMLDialogElement>(null);useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(name!==undefined&&!dialog.open)dialog.showModal();else if(name===undefined&&dialog.open)dialog.close()},[name]);return <dialog className="mobileTableMenu participantRemovalDialog" ref={ref} aria-label={copy.title} onCancel={event=>{if(busy)event.preventDefault();else onCancel()}} onClose={onCancel}><header><h2>{copy.title}</h2><button className="secondary" aria-label={copy.cancel} disabled={busy} onClick={onCancel}>✕</button></header><div><strong>{name}</strong><p>{copy.help}</p>{error&&<p className="error" role="alert">{error}</p>}<button className="secondary" disabled={busy} onClick={onCancel}>{copy.cancel}</button><button className="danger" disabled={disabled||busy} onClick={onConfirm}>{t('lobby.removePlayer')}</button></div></dialog>}

/** Failed removal keeps the confirmation open; a later retry can succeed. */
export async function attemptParticipantRemoval(id:string,remove:(id:string)=>Promise<void|boolean>,fallbackError:string):Promise<{removed:true}|{removed:false;error:string}>{try{const result=await remove(id);return result===false?{removed:false,error:fallbackError}:{removed:true}}catch(failure){return{removed:false,error:failure instanceof Error?failure.message:String(failure)}}}
