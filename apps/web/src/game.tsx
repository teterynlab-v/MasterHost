import {authoredActorLabel,authoredValue,contentFieldLabel, type ContentPack} from './i18n/content.js';
import {useContentI18n} from './i18n/content-react.js';
import React, { useEffect, useState } from "react";
import { currentRealm, realmHeaders } from "./realm.js";
import { sessionSocket } from "./session-client.js";
import type { ConnectionStatus } from "./session-client.js";
import {AdvancedSessionPanel} from "./advanced-session.js";
import{gmWorkspaces,initialGmWorkspace}from"./gm-workspace.js";import type{GmWorkspace}from"./gm-workspace.js";import{LanguageSwitcher,useI18n}from"./i18n/react.js";

const API = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? "http://localhost:8080/api";
type Participant = { id: string; displayName: string; accessToken?: string;ready?:boolean;characterId?:string };
type Actor = { actorId: string; kind?: "npc"; label?: string; labelSource?:string;worldEntityNameSource?:string; templateId?:string; worldEntityId?: string; worldEntityPath?:string;worldEntityLabel?:string;worldEntityRevision?:number;worldEntityStatus?:"current"|"missing"|"incompatible"; attributes?:Record<string,number>; resources: Record<string, number>; effects: { id: string; definitionId: string; remaining?: number }[];inventory?:{itemId:string;quantity:number}[];progression?:Record<string,number>;locationId?:string };
type Encounter = { id: string; state: "live" | "ended"; orderingPolicy: string; participants: string[]; order: string[]; currentActorId?: string; round: number; turn: number };
type Definitions = { pack?:ContentPack; resources?:Record<string,{label:string}>;characterCreation?:SheetSchema;effects?:Record<string,{label:string}>; checks: Record<string, { label: string;dice?:string }>; actions: Record<string, { label: string; target: string }>; items:Record<string,{label:string}>;progression:Record<string,{label:string}>;locations:{worldEntityKinds:string[]};actorTemplates: Record<string, { label: string; attributes?:Record<string,number>; worldEntityKinds?: string[] }>; encounter: { orderingPolicy: string } };
type WorldActor = { nameSource?:string; id: string; kind: string; name: string; materializationPath: string; portrait?: string };
type GameEvent = { id: string; sequence: number; type: string; createdAt: string };
type PendingCheck = { request: { id: string; checkId: string; difficulty?: number }; resolution: CheckResolution | null };
type CheckResolution = { checkId?:string; outcome?: "critical-success"|"success" | "failure"|"critical-failure"; total?: number; modifier?: number; roll?: { total: number } };
type SessionContext={session:{id:string;state:string;startedAt?:string};campaign:{id:string;name:string};world:{id:string;name:string;revision:number};pack:{id:string;name:string;version:string};media?:Partial<Record<"map"|"portrait"|"background"|"token"|"item"|"location",string>>};
type SheetSchema=ContentPack & {starting?:{traits:{id:string;when?:{field:string;equals:unknown}}[]};steps:{fields:{id:string;label:string;type:string;options?:{value:string;label:string}[]}[]}[]};
export function characterSheetValues(schema:SheetSchema|undefined,values:Record<string,unknown>,c:(source:unknown)=>string=String){return schema?.steps.flatMap(step=>step.fields).filter(field=>field.id!=="name"&&field.type!=="asset"&&values[field.id]!==undefined).map(field=>({id:field.id,label:c(field.label),value:field.options?.find(option=>option.value===values[field.id])?c(field.options.find(option=>option.value===values[field.id])!.label):String(values[field.id])}))??Object.entries(values).map(([id,value])=>({id,label:id,value:String(value)}))}
export function characterSheetTraits(schema:SheetSchema|undefined, values:Record<string,unknown>,traits:string[]){
 const displayedFields=new Set(characterSheetValues(schema,values).map(field=>field.id));
 const represented=new Set(schema?.starting?.traits.filter(trait=>trait.when&&displayedFields.has(trait.when.field)&&values[trait.when.field]===trait.when.equals).map(trait=>trait.id)??[]);
 return traits.filter(trait=>!represented.has(trait));
}
type Character={displayName:string;values:Record<string,unknown>;traits:string[];assets:Record<string,unknown>};
export function characterPortraitPath(assets:Record<string,unknown>|undefined,fallback:string|undefined){return typeof assets?.portrait==="string"&&assets.portrait?assets.portrait:fallback}
type PlaytestReport={durationMinutes:number;eventCount:number;gatePassed:boolean;evidence:{checks:number;actions:number;encounters:number;travelMoves:number;reconnects:number;narrativeEvents:number}};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {...init,headers:realmHeaders(init?.headers)});
  const body: unknown = await response.json();
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "message" in body ? String(body.message) : `HTTP ${response.status}`;
    throw Error(message);
  }
  return body as T;
}
const headers = (token: string) => ({ authorization: `Bearer ${token}` });
const authorizedPost = <T,>(path: string, body: object, token: string) => call<T>(path, { method: "POST", headers: { "content-type": "application/json", ...headers(token) }, body: JSON.stringify(body) });
const nameOf = (id: string | undefined, participants: Participant[], actors: Actor[], c:(source:unknown)=>string=String) => {const actor=actors.find(actor=>actor.actorId===id);return actor?.kind==="npc"?authoredActorLabel(actor,c):participants.find(participant=>participant.id===id)?.displayName??actor?.label??c("Unknown actor")};
function ConnectionBadge({status}:{status:ConnectionStatus}){const{t}=useI18n();const{c}=useContentI18n();const label=status==="live"?t("common.connected"):status==="offline"?t("common.offline"):status==="recovering"?t("common.reconnecting"):status==="connecting"?t("common.connecting"):t("common.disconnected");return <span className={`connection ${status}`} role="status">● {label}</span>}
function NpcEditor({actor,template,pack,schema,busy,inEncounter,onEdit,onRemove}:{actor:Actor;template?:Definitions["actorTemplates"][string];pack?:ContentPack;schema?:SheetSchema;busy:boolean;inEncounter:boolean;onEdit:(label:string|undefined,attributes:Record<string,number>)=>Promise<void>;onRemove:()=>Promise<void>}){
 const{c}=useContentI18n(pack);
 const[label,setLabel]=useState(actor.label??"NPC"),[labelEdited,setLabelEdited]=useState(false),[attributes,setAttributes]=useState<Record<string,number>>(actor.attributes??{});useEffect(()=>{setLabel(actor.label??"NPC");setLabelEdited(false);setAttributes(actor.attributes??{})},[actor.label,JSON.stringify(actor.attributes)]);
 return <div className="npcEditor"><label>{c("NPC name")}<input value={labelEdited?label:authoredActorLabel(actor,c)} maxLength={80} onChange={event=>{setLabelEdited(true);setLabel(event.target.value)}}/></label>{Object.keys(template?.attributes??{}).map(key=><label key={key}>{c(contentFieldLabel(key,schema))}<input type="number" value={attributes[key]??0} onChange={event=>setAttributes({...attributes,[key]:Number(event.target.value)})}/></label>)}<div className="actions"><button className="secondary" disabled={busy||!label.trim()} onClick={()=>void onEdit(labelEdited?label.trim():undefined,attributes)}>{c("SAVE NPC")}</button><button className="secondary" disabled={busy||inEncounter} title={inEncounter?c("Remove from the active Encounter first"):undefined} onClick={()=>void onRemove()}>{c("DELETE NPC")}</button></div></div>
}

export function GmGame({ session, participants, gmToken,worldId,worldName,campaignName,onOpenPlayer,onRemoveParticipant }: { session: { id: string;pin?:string }; participants: Participant[]; gmToken: string;worldId?:string;worldName?:string;campaignName?:string;onOpenPlayer?:()=>void;onRemoveParticipant?:(participantId:string)=>Promise<void> }) {
  const{t}=useI18n();
  const [defs, setDefs] = useState<Definitions>({ checks: {}, actions: {},items:{},progression:{},locations:{worldEntityKinds:[]}, actorTemplates: {}, encounter: { orderingPolicy: "none" } });
  const{c}=useContentI18n(defs.pack);
  const [actorId, setActorId] = useState("");
  const [checkParticipantId, setCheckParticipantId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [worldEntityId, setWorldEntityId] = useState("");
  const [worldActors, setWorldActors] = useState<WorldActor[]>([]);
  const [targetId, setTargetId] = useState("");
  const [targetIds, setTargetIds] = useState<string[]>([]);
  const [checkId, setCheckId] = useState("");
  const [actionId, setActionId] = useState("");
  const [difficulty, setDifficulty] = useState(14);
  const [visibility,setVisibility]=useState("full"),[itemId,setItemId]=useState(""),[progressionId,setProgressionId]=useState(""),[locationId,setLocationId]=useState(""),[quantity,setQuantity]=useState(1);
  const[locations,setLocations]=useState<WorldActor[]>([]);
  const[playtest,setPlaytest]=useState<PlaytestReport>();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [encounterIds, setEncounterIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [connection,setConnection]=useState<ConnectionStatus>("connecting"),[narrative,setNarrative]=useState("");
  const[workspace,setWorkspace]=useState<GmWorkspace>(initialGmWorkspace);

  async function refresh() {
    const [nextEvents, nextActors, nextEncounters,nextWorldActors,nextLocations,nextPlaytest] = await Promise.all([
      call<GameEvent[]>(`/sessions/${session.id}/events`, { headers: headers(gmToken) }),
      call<Actor[]>(`/sessions/${session.id}/actors`, { headers: headers(gmToken) }),
      call<Encounter[]>(`/sessions/${session.id}/encounters`, { headers: headers(gmToken) }),
      call<WorldActor[]>(`/sessions/${session.id}/world-actors`, { headers: headers(gmToken) }),
      call<WorldActor[]>(`/sessions/${session.id}/locations`, { headers: headers(gmToken) }),
      call<PlaytestReport>(`/sessions/${session.id}/playtest-report`,{headers:headers(gmToken)}),
    ]);
    setEvents(nextEvents); setActors(nextActors); setEncounters(nextEncounters);setWorldActors(nextWorldActors);setLocations(nextLocations);setPlaytest(nextPlaytest);
  }
  useEffect(() => {
    void call<Definitions>(`/game/definitions?sessionId=${encodeURIComponent(session.id)}`).then(value => {
      setDefs(value);
      setCheckId(Object.keys(value.checks)[0] ?? "");
      setActionId(Object.keys(value.actions)[0] ?? "");
      setTemplateId(Object.keys(value.actorTemplates)[0] ?? "");
      setItemId(Object.keys(value.items)[0]??"");setProgressionId(Object.keys(value.progression)[0]??"");
    }).catch(failure => setError(String(failure)));
    void refresh().catch(failure => setError(String(failure)));
  }, [session.id]);
  useEffect(() => {
    const socket = sessionSocket(session.id, gmToken, event => {
      if (["check.requested", "check.resolved", "actor.state", "actor.removed", "action.resolved", "encounter.state", "session.snapshot", "session.catchup", "session.event"].includes(event.type)) void refresh().catch(failure => setError(String(failure)));
    },setConnection);
    return () => socket.close();
  }, [session.id, gmToken]);
  useEffect(() => {
    const ids = new Set(actors.map(actor => actor.actorId));
    const players = participants.filter(participant => ids.has(participant.id));
    if (!ids.has(actorId)) setActorId(actors[0]?.actorId ?? "");
    if (!ids.has(targetId)) setTargetId(actors[0]?.actorId ?? "");
    if (!players.some(participant => participant.id === checkParticipantId)) setCheckParticipantId(players[0]?.id ?? "");
    setTargetIds(values => values.filter(id => ids.has(id)));
    setEncounterIds(values => values.filter(id => ids.has(id)));
  }, [actors, participants]);

  async function run(command: () => Promise<unknown>) {
    setBusy(true); setError("");
    try { await command(); await refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); await refresh().catch(() => undefined); }
    finally { setBusy(false); }
  }
  const available = actors.map(actor => ({ id: actor.actorId, displayName: nameOf(actor.actorId, participants, actors,c) }));
  const availablePlayers = participants.filter(participant => actors.some(actor => actor.actorId === participant.id));
  const action = defs.actions[actionId];
  const targetPolicy = action?.target === "actor" ? "single-actor" : action?.target;
  const activeEncounter = encounters.find(encounter => encounter.state === "live");
  const eligibleWorldActors = worldActors.filter(entity => defs.actorTemplates[templateId]?.worldEntityKinds?.includes(entity.kind) && !actors.some(actor => actor.worldEntityId === entity.id));
  const toggle = (ids: string[], id: string) => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
  function moveEncounter(id: string, direction: number) {
    const from = encounterIds.indexOf(id), to = from + direction;
    if (to < 0 || to >= encounterIds.length) return;
    const next = [...encounterIds]; [next[from], next[to]] = [next[to], next[from]];
    setEncounterIds(next);
  }
  async function applyAction() {
    const ids = targetPolicy === "none" ? [] : targetPolicy === "self" ? [actorId] : targetPolicy === "multiple-actors" ? targetIds : [targetId];
    await authorizedPost(`/sessions/${session.id}/actions`, { actorId, targetActorIds: ids, actionId, inputs: { difficulty } }, gmToken);
  }
  async function startEncounter() {
    await authorizedPost(`/sessions/${session.id}/encounters`, { participantIds: encounterIds, ...(defs.encounter.orderingPolicy === "custom" ? { customOrder: encounterIds } : {}) }, gmToken);
  }
  const locationLabel=(id:string|undefined)=>{const location=locations.find(value=>value.id===id);return authoredValue({value:location?.name??id,source:location?.nameSource},c)};
  const npcPortrait=(actor:Actor)=>{const path=worldActors.find(entity=>entity.id===actor.worldEntityId)?.portrait;return path&&worldId?`${API}/worlds/${encodeURIComponent(worldId)}/pack-assets/${path.replace(/^assets\//,"")}?realm=${encodeURIComponent(currentRealm())}`:undefined};
  const labels:Record<GmWorkspace,string>={table:t("gm.table"),checks:t("gm.checks"),encounter:t("gm.encounter"),party:t("gm.party"),journal:t("gm.journal")};
  return <section className="gmConsole">
    <header className="cockpitTopbar"><div className="cockpitBrand"><span className="brandMark">M</span><b>MasterHost</b></div><div className="cockpitCampaign"><small>{worldName}</small><strong>{campaignName??t("gm.console")}</strong></div><ConnectionBadge status={connection}/>{session.pin&&<span className="cockpitCode">{t("lobby.code")}: <b>{session.pin}</b></span>}<LanguageSwitcher/></header>
    {workspace!=="table"&&<nav className="workspaceNav" aria-label={t("gm.console")}>{gmWorkspaces.map(value=><button key={value} className={workspace===value?"selected secondary":"secondary"} aria-current={workspace===value?"page":undefined} onClick={()=>setWorkspace(value)}>{labels[value]}</button>)}</nav>}
    {error && <p className="error" role="alert">{error}</p>}
    <div hidden={workspace!=="table"} className="gmCockpitBody"><AdvancedSessionPanel sessionId={session.id} token={gmToken} gm actors={actors.map(actor=>({...actor,label:nameOf(actor.actorId,participants,actors,c)}))} worldId={worldId} onOpenChecks={()=>setWorkspace("checks")} onOpenEncounter={()=>setWorkspace("encounter")}/><aside className="gmPlayersDock"><div className="titleRow"><div><p className="eyebrow">{t("lobby.players",{count:participants.length})}</p></div>{onOpenPlayer&&<button className="secondary compactButton" onClick={onOpenPlayer}>＋</button>}</div>{participants.length===0?<p className="muted">{t("lobby.empty")}</p>:participants.map(participant=><div className="playerDockRow" key={participant.id}><span className="avatar">{participant.displayName.slice(0,2).toUpperCase()}</span><span><b>{participant.displayName}</b><small><i className="presenceDot"/>{participant.characterId?t("player.joined"):t("lobby.choosingCharacter")}</small></span>{onRemoveParticipant&&<button className="iconButton" title={t("lobby.removePlayer")} onClick={()=>void onRemoveParticipant(participant.id)}>⋯</button>}</div>)}<h3 className="dockSubheading">{c("NPC")}</h3>{actors.filter(actor=>actor.kind==="npc").slice(0,5).map(actor=><div className="playerDockRow" key={actor.actorId}><span className="avatar npcAvatar">{(actor.label??"NPC").slice(0,2).toUpperCase()}{npcPortrait(actor)&&<img className="avatarArt" src={npcPortrait(actor)} alt="" onError={event=>{event.currentTarget.hidden=true}} onLoad={event=>{event.currentTarget.hidden=false}}/>}</span><span><b>{authoredActorLabel(actor,c)||c("NPC")}</b><small>{actor.locationId?locationLabel(actor.locationId)||t("player.location"):t("gm.live")}</small></span></div>)}</aside></div>
    {workspace==="party"&&<><div className="workspaceIntro"><div><h3>{t("gm.party")}</h3><p>{t("gm.partyHelp")}</p></div></div>
    <button className="secondary" disabled={busy || participants.length === 0} onClick={() => void run(async () => {
      for (const participant of participants) if (!actors.some(actor => actor.actorId === participant.id)) await authorizedPost(`/sessions/${session.id}/participants/${participant.id}/initialize`, {}, gmToken);
    })}>{c("Initialize party runtime")}</button>
    {templateId && <div className="actions"><label>{c("NPC template")}<select value={templateId} onChange={event => { setTemplateId(event.target.value); setWorldEntityId(""); }}>{Object.entries(defs.actorTemplates).map(([id, template]) => <option key={id} value={id}>{c(template.label)}</option>)}</select></label><label>{c("World entity (optional)")}<select value={worldEntityId} onChange={event => setWorldEntityId(event.target.value)}><option value="">{c("Session NPC")}</option>{eligibleWorldActors.map(entity => <option key={entity.id} value={entity.id}>{authoredValue({value:entity.name,source:entity.nameSource},c)} · {c(entity.kind)}</option>)}</select></label><button className="secondary" disabled={busy} onClick={() => void run(async () => { await authorizedPost(`/sessions/${session.id}/actors`, { templateId, ...(worldEntityId ? { worldEntityId } : {}) }, gmToken); setWorldEntityId(""); })}>{c("ADD NPC")}</button><button className="secondary" disabled={busy||!actors.some(actor=>actor.worldEntityId)} onClick={()=>void run(()=>authorizedPost(`/sessions/${session.id}/actors/reconcile-world`,{},gmToken))}>{c("RECONCILE WORLD LINKS")}</button></div>}
    <h3>{c("Actors")}</h3>
    {[...participants.map(participant => ({ id: participant.id, name: participant.displayName })), ...actors.filter(actor => actor.kind === "npc").map(actor => ({ id: actor.actorId, name: authoredActorLabel(actor,c)||c("NPC") }))].map(entry => {
      const actor = actors.find(value => value.actorId === entry.id);
      return <article key={entry.id}><h3>{entry.name}</h3>
        {actor?.worldEntityId && <small>{c("World entity:")} {authoredValue({value:actor.worldEntityLabel??worldActors.find(entity => entity.id === actor.worldEntityId)?.name??actor.worldEntityId,source:actor.worldEntityNameSource},c)} · {c(actor.worldEntityStatus??"unreconciled")}{actor.worldEntityRevision!==undefined?` at r${actor.worldEntityRevision}`:""}</small>}
        {actor ? Object.entries(actor.resources).map(([key, value]) => <div className="row" key={key}><b>{c(defs.resources?.[key]?.label??key)}</b><span>{value}</span></div>) : <p className="muted">{c("Not initialized")}</p>}
        {actor?.effects.map(effect => <small key={effect.id}>{c("Effect:")} {c(defs.effects?.[effect.definitionId]?.label??effect.definitionId)}{effect.remaining !== undefined ? ` (${effect.remaining})` : ""}</small>)}
        {actor?.inventory?.map(item=><small key={item.itemId}>{c("Item:")} {c(defs.items[item.itemId]?.label??item.itemId)} × {item.quantity}</small>)}
        {Object.entries(actor?.progression??{}).map(([id,value])=><small key={id}>{c(defs.progression[id]?.label??id)}: {value}</small>)}
        {actor?.locationId&&<small>{c("Location:")} {locationLabel(actor.locationId)}</small>}
        {actor?.kind==="npc"&&<NpcEditor actor={actor} pack={defs.pack} schema={defs.characterCreation} template={actor.templateId?defs.actorTemplates[actor.templateId]:undefined} busy={busy} inEncounter={Boolean(activeEncounter?.participants.includes(actor.actorId))} onEdit={(label,attributes)=>run(()=>authorizedPost(`/sessions/${session.id}/actors/${actor.actorId}/edit`,{label,attributes},gmToken))} onRemove={()=>run(()=>authorizedPost(`/sessions/${session.id}/actors/${actor.actorId}/remove`,{},gmToken))}/>}
      </article>;
    })}
    <h3>{c("Inventory, progression and location")}</h3>
    <label>{c("Actor")}<select value={actorId} onChange={event=>setActorId(event.target.value)}>{available.map(actor=><option key={actor.id} value={actor.id}>{actor.displayName}</option>)}</select></label>
    {itemId&&<><label>{c("Loot")}<select value={itemId} onChange={event=>setItemId(event.target.value)}>{Object.entries(defs.items).map(([id,item])=><option key={id} value={id}>{c(item.label)}</option>)}</select></label><label>{c("Quantity")}<input type="number" min="1" value={quantity} onChange={event=>setQuantity(Number(event.target.value))}/></label><button disabled={busy||!actorId} onClick={()=>void run(()=>authorizedPost(`/sessions/${session.id}/items/grant`,{actorId,itemId,quantity},gmToken))}>{c("GRANT LOOT")}</button></>}
    {progressionId&&<><label>{c("Progression")}<select value={progressionId} onChange={event=>setProgressionId(event.target.value)}>{Object.entries(defs.progression).map(([id,value])=><option key={id} value={id}>{c(value.label)}</option>)}</select></label><button disabled={busy||!actorId} onClick={()=>void run(()=>authorizedPost(`/sessions/${session.id}/progression`,{actorId,progressionId,amount:quantity},gmToken))}>{c("AWARD")}</button></>}
    {locations.length>0&&<><label>{c("Location")}<select value={locationId} onChange={event=>setLocationId(event.target.value)}><option value="">{c("Choose…")}</option>{locations.map(location=><option key={location.id} value={location.id}>{authoredValue({value:location.name,source:location.nameSource},c)}</option>)}</select></label><div className="actions"><button disabled={busy||!actorId||!locationId} onClick={()=>void run(()=>authorizedPost(`/sessions/${session.id}/location`,{actorId,locationId},gmToken))}>{c("MOVE ACTOR")}</button><button className="secondary" disabled={busy||!locationId||!actors.length} onClick={()=>void run(()=>authorizedPost(`/sessions/${session.id}/travel`,{actorIds:actors.map(actor=>actor.actorId),locationId},gmToken))}>{c("TRAVEL PARTY")}</button></div></>}
    </>}
    {workspace==="checks"&&<><div className="workspaceIntro"><div><h3>{t("gm.checks")}</h3><p>{t("gm.checksHelp")}</p></div>{activeEncounter&&<button className="secondary" onClick={()=>setWorkspace("encounter")}>{t("gm.openEncounter")}</button>}</div>
    <h3>{c("Request check")}</h3>
    <label>{c("Player")}<select value={checkParticipantId} onChange={event => setCheckParticipantId(event.target.value)}>{availablePlayers.map(participant => <option key={participant.id} value={participant.id}>{participant.displayName}</option>)}</select></label>
    <label>{c("Check")}<select value={checkId} onChange={event => setCheckId(event.target.value)}>{Object.entries(defs.checks).map(([id, check]) => <option key={id} value={id}>{c(check.label)}</option>)}</select></label>
    <label>{t("player.difficulty")}<input type="number" value={difficulty} onChange={event => setDifficulty(Number(event.target.value))} /></label>
    <label>{c("Player visibility")}<select value={visibility} onChange={event=>setVisibility(event.target.value)}><option value="full">{c("Full roll and DC")}</option><option value="result-only">{c("Result, hidden DC")}</option><option value="roll-only">{c("Roll, hidden outcome and DC")}</option><option value="hidden">{c("Hidden result and DC")}</option></select></label>
    <button disabled={busy || !checkParticipantId || !checkId} onClick={() => void run(() => authorizedPost(`/sessions/${session.id}/checks`, { participantId: checkParticipantId, checkId, difficulty, visibility }, gmToken))}>{c("SEND CHECK")}</button>

    <h3>{c("Action")}</h3>
    <label>{c("Source actor")}<select value={actorId} onChange={event => setActorId(event.target.value)}>{available.map(actor => <option key={actor.id} value={actor.id}>{actor.displayName}</option>)}</select></label>
    <label>{c("Action")}<select value={actionId} onChange={event => setActionId(event.target.value)}>{Object.entries(defs.actions).map(([id, definition]) => <option key={id} value={id}>{c(definition.label)}</option>)}</select></label>
    {targetPolicy === "single-actor" && <label>{c("Target")}<select value={targetId} onChange={event => setTargetId(event.target.value)}>{available.map(participant => <option key={participant.id} value={participant.id}>{participant.displayName}</option>)}</select></label>}
    {targetPolicy === "multiple-actors" && <fieldset className="choiceList"><legend>{t("player.targets")}</legend>{available.map(participant => <label key={participant.id}><input type="checkbox" checked={targetIds.includes(participant.id)} onChange={() => setTargetIds(ids => toggle(ids, participant.id))} />{participant.displayName}</label>)}</fieldset>}
    <button disabled={busy || !actorId || !actionId || targetPolicy === "single-actor" && !targetId || targetPolicy === "multiple-actors" && !targetIds.length} onClick={() => void run(applyAction)}>{c("APPLY ACTION")}</button>

    </>}
    {workspace==="encounter"&&<><div className="workspaceIntro"><div><h3>{t("gm.encounter")}</h3><p>{t("gm.encounterHelp")}</p></div></div>
    <h3>{c("Encounter")}</h3>
    {activeEncounter ? <article>
      <p>{c("Ordering:")} <b>{activeEncounter.orderingPolicy}</b></p>
      {activeEncounter.currentActorId ? <p>{c("Round")} {activeEncounter.round} {c("· Turn")} {activeEncounter.turn} {c("· Current:")} <b>{nameOf(activeEncounter.currentActorId, participants, actors,c)}</b></p> : <p>{c("No turn order for this Pack.")}</p>}
      {activeEncounter.order.length > 0 && <p>{c("Order:")} {activeEncounter.order.map(id => nameOf(id, participants, actors,c)).join(" → ")}</p>}
      <p>{c("Participants:")} {activeEncounter.participants.map(id => nameOf(id, participants, actors,c)).join(", ")}</p>
      <div className="actions">{available.filter(actor => !activeEncounter.participants.includes(actor.id)).map(actor => <button className="secondary" key={actor.id} disabled={busy} onClick={() => void run(() => authorizedPost(`/encounters/${activeEncounter.id}/participants`, { addActorIds: [actor.id] }, gmToken))}>{c("ADD")} {actor.displayName}</button>)}</div>
      <div className="actions">{activeEncounter.participants.filter(id => id !== activeEncounter.currentActorId && activeEncounter.participants.length > 1).map(id => <button className="secondary" key={id} disabled={busy} onClick={() => void run(() => authorizedPost(`/encounters/${activeEncounter.id}/participants`, { removeActorIds: [id] }, gmToken))}>{c("REMOVE")} {nameOf(id, participants, actors,c)}</button>)}</div>
      <div className="actions">
        {activeEncounter.currentActorId && <button disabled={busy} onClick={() => void run(() => authorizedPost(`/encounters/${activeEncounter.id}/advance`, {}, gmToken))}>{c("END TURN")}</button>}
        <button className="secondary" disabled={busy} onClick={() => void run(() => authorizedPost(`/encounters/${activeEncounter.id}/end`, {}, gmToken))}>{c("END ENCOUNTER")}</button>
      </div>
    </article> : <article>
      <p>{c("Ordering policy:")} <b>{c(defs.encounter.orderingPolicy)}</b></p>
      <button className="secondary" disabled={busy || available.length === 0} onClick={() => setEncounterIds(available.map(participant => participant.id))}>{c("Select all initialized actors")}</button>
      <fieldset className="choiceList"><legend>{c("Participants")}</legend>{available.map(participant => <label key={participant.id}><input type="checkbox" checked={encounterIds.includes(participant.id)} onChange={() => setEncounterIds(ids => toggle(ids, participant.id))} />{participant.displayName}{defs.encounter.orderingPolicy === "custom" && encounterIds.includes(participant.id) && <span><button className="tiny" disabled={encounterIds[0] === participant.id} onClick={() => moveEncounter(participant.id, -1)}>↑</button> <button className="tiny" disabled={encounterIds.at(-1) === participant.id} onClick={() => moveEncounter(participant.id, 1)}>↓</button></span>}</label>)}</fieldset>
      <button disabled={busy || encounterIds.length === 0} onClick={() => void run(startEncounter)}>{c("START ENCOUNTER")}</button>
    </article>}
    </>}
    {workspace==="journal"&&<><div className="workspaceIntro"><div><h3>{t("gm.journal")}</h3><p>{t("gm.journalHelp")}</p></div></div>
    <h3>{c("Session")}</h3>
    <label>{c("Record event")}<textarea rows={3} maxLength={1000} value={narrative} onChange={event=>setNarrative(event.target.value)} placeholder={c("What changed in the fiction?")}/></label>
    <button className="secondary" disabled={busy||!narrative.trim()} onClick={()=>void run(async()=>{await authorizedPost(`/sessions/${session.id}/events/narrative`,{text:narrative.trim()},gmToken);setNarrative("")})}>{c("ADD TO SESSION LOG")}</button>
    <button className="secondary" disabled={busy || Boolean(activeEncounter)} onClick={() => void run(() => authorizedPost(`/sessions/${session.id}/state`, { state: "finished" }, gmToken))}>{c("FINISH SESSION")}</button>
    {activeEncounter && <p className="muted">{c("End the encounter before finishing the session.")}</p>}
    <h3>{c("Game log")}</h3>
    {events.slice(-15).reverse().map(event => <div className="row gameLogRow" key={event.id}><b>#{event.sequence} {c(event.type)}</b><small>{new Date(event.createdAt).toLocaleTimeString()}</small></div>)}
    {playtest&&<details className="technicalEvidence"><summary>{t("gm.devTools")}</summary><p><b>{playtest.durationMinutes} {c("/ 120 minutes")}</b> · {playtest.eventCount} {c("events ·")} {playtest.gatePassed?"gate passed":"gate open"}</p></details>}
    </>}
  </section>;
}

export function PlayerGame({ session, participant, onLeave }: { session: { id: string }; participant: Participant & { accessToken: string }; onLeave: () => void }) {
  const{t}=useI18n();
  const [pending, setPending] = useState<PendingCheck[]>([]);
  const [last, setLast] = useState<{ resolution: CheckResolution }>();
  const [actor, setActor] = useState<Actor>();
  const [encounter, setEncounter] = useState<Encounter>();
  const [error, setError] = useState("");
  const[connection,setConnection]=useState<ConnectionStatus>("connecting"),[defs,setDefs]=useState<Definitions>({checks:{},actions:{},items:{},progression:{},locations:{worldEntityKinds:[]},actorTemplates:{},encounter:{orderingPolicy:"none"}}),[locations,setLocations]=useState<WorldActor[]>([]),[context,setContext]=useState<SessionContext>(),[character,setCharacter]=useState<Character>(),[sheetSchema,setSheetSchema]=useState<SheetSchema>(),[party,setParty]=useState<Participant[]>([]),[allActors,setAllActors]=useState<Actor[]>([]),[activity,setActivity]=useState<{sequence:number;type:string;text?:string}[]>([]),[playerActionId,setPlayerActionId]=useState(""),[playerTargetIds,setPlayerTargetIds]=useState<string[]>([]),[actionDifficulty,setActionDifficulty]=useState(14),[acting,setActing]=useState(false),[rolling,setRolling]=useState(false);
  const{c}=useContentI18n(defs.pack);
  async function refresh() {
    const [checks, actors, encounters,nextDefs,nextLocations,nextContext,nextCharacter,snapshot,creation] = await Promise.all([
      call<PendingCheck[]>(`/sessions/${session.id}/participants/${participant.id}/checks`, { headers: headers(participant.accessToken) }),
      call<Actor[]>(`/sessions/${session.id}/actors`, { headers: headers(participant.accessToken) }),
      call<Encounter[]>(`/sessions/${session.id}/encounters`, { headers: headers(participant.accessToken) }),
      call<Definitions>(`/game/definitions?sessionId=${encodeURIComponent(session.id)}`),
      call<WorldActor[]>(`/sessions/${session.id}/locations`,{headers:headers(participant.accessToken)}),
      call<SessionContext>(`/sessions/${session.id}/context`,{headers:headers(participant.accessToken)}),
      call<Character>(`/participants/${participant.id}/character`,{headers:headers(participant.accessToken)}),
      call<{participants:Participant[]}>(`/sessions/${session.id}`,{headers:headers(participant.accessToken)}),
      call<{schema:SheetSchema}>(`/character-creation?sessionId=${encodeURIComponent(session.id)}`),
    ]);
    setPending(checks); setAllActors(actors);setActor(actors.find(value => value.actorId === participant.id)); setEncounter(encounters.find(value => value.state === "live"));setDefs(nextDefs);setLocations(nextLocations);setContext(nextContext);setCharacter(nextCharacter);setParty(snapshot.participants);setSheetSchema(creation.schema);setPlayerActionId(value=>value||(Object.keys(nextDefs.actions)[0]??""));
  }
  useEffect(() => { void refresh().catch(failure => setError(String(failure))); }, [session.id, participant.id]);
  useEffect(() => {
    const socket = sessionSocket(session.id, participant.accessToken, event => {
      const missed=event.payload?.missedEvents;if(Array.isArray(missed))setActivity(values=>{const combined=[...values,...missed],seen=new Set<number>();return combined.filter(value=>!seen.has(value.sequence)&&seen.add(value.sequence)).slice(-12)});
      else if(Number.isSafeInteger(event.sequence))setActivity(values=>[...values,{sequence:event.sequence,type:event.type,text:event.type==="session.event"?event.payload?.text:undefined}].slice(-12));
      if (["check.requested", "check.resolved", "actor.state", "action.resolved", "encounter.state", "table.state", "session.snapshot", "session.catchup", "session.event"].includes(event.type)) void refresh().catch(failure => setError(String(failure)));
    },setConnection);
    return () => socket.close();
  }, [session.id, participant.id, participant.accessToken]);
  async function roll(check: PendingCheck) {
    setRolling(true);try { const resolution = await authorizedPost<CheckResolution>(`/checks/${check.request.id}/roll`, {}, participant.accessToken); setLast({ resolution:{...resolution,checkId:check.request.checkId} }); setError(""); await refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }finally{setRolling(false)}
  }
  async function useAction(){if(!actor||!playerActionId)return;setActing(true);setError("");try{const definition=defs.actions[playerActionId],policy=definition?.target==="actor"?"single-actor":definition?.target,targetActorIds=policy==="self"?[actor.actorId]:policy==="none"?[]:playerTargetIds;const result=await authorizedPost<{events:{type:string;payload:CheckResolution}[]}>(`/sessions/${session.id}/actions`,{actorId:actor.actorId,actionId:playerActionId,targetActorIds,inputs:{difficulty:actionDifficulty}},participant.accessToken);const resolved=result.events.find(event=>event.type==="CheckResolved");if(resolved)setLast({resolution:resolved.payload});await refresh()}catch(failure){setError(failure instanceof Error?failure.message:String(failure))}finally{setActing(false)}}
  const current = pending.find(check => !check.resolution);
  const shownResolution = last?.resolution ?? pending.find(check => check.resolution)?.resolution;
  const shownCheckId=current?.request.checkId??shownResolution?.checkId,shownDice=shownCheckId?defs.checks[shownCheckId]?.dice??"d20":"d20";
  const locationName=locations.find(value=>value.id===actor?.locationId)?.name;
  const playerAction=defs.actions[playerActionId],playerTargetPolicy=playerAction?.target==="actor"?"single-actor":playerAction?.target,targetChoices=allActors.map(value=>({id:value.actorId,name:nameOf(value.actorId,party,allActors,c)}));
  const actionEntries=Object.entries(defs.actions),portrait=characterPortraitPath(character?.assets,context?.media?.portrait),portraitUrl=portrait&&context?`${API}/worlds/${encodeURIComponent(context.world.id)}/pack-assets/${portrait.replace(/^assets\//,"")}?realm=${encodeURIComponent(currentRealm())}`:undefined;
  return <section className="playerCockpit">
    <header className="playerTopbar"><div className="cockpitBrand"><span className="brandMark">M</span><b>MasterHost</b></div><div className="cockpitCampaign"><small>{context?.world.name}</small><strong>{context?.campaign.name??c("GAME LIVE")}</strong></div><ConnectionBadge status={connection}/><button className="iconButton" title={t("player.refresh")} onClick={()=>void refresh().catch(failure=>setError(String(failure)))}>↻</button><button className="secondary compactButton" onClick={onLeave}>{t("join.other")}</button></header>
    {error&&<p className="error playerCockpitMessage" role="alert">{error}</p>}
    <main className="playerCockpitBody">
      <section className="playerStage" id="player-map"><div className="partyPortraits" aria-label={t("player.group")}>{party.map(member=><div className={member.id===participant.id?"partyPortrait current":"partyPortrait"} key={member.id}><span>{member.displayName.slice(0,2).toUpperCase()}</span><small>{member.id===participant.id?t("player.you"):member.displayName}</small></div>)}</div><AdvancedSessionPanel sessionId={session.id} token={participant.accessToken} gm={false} variant="player-map" actors={allActors}/></section>
      <aside className="playerSheetPanel" id="player-character">{portraitUrl?<img className="characterPortrait" src={portraitUrl} alt={character?.displayName??t("player.character")} onError={event=>{event.currentTarget.hidden=true}}/>:<div className="characterPortraitFallback">{character?.displayName.slice(0,2).toUpperCase()??"PC"}</div>}<div className="characterIdentity"><p className="eyebrow">{t("player.character")}</p><h2>{character?.displayName??participant.displayName}</h2><small>{locationName?authoredValue({value:locationName,source:locations.find(value=>value.id===actor?.locationId)?.nameSource},c):context?.world.name}</small></div>{actor&&<div className="playerResourceGrid">{Object.entries(actor.resources).map(([key,value])=><div key={key}><span>{c(defs.resources?.[key]?.label??key)}</span><strong>{value}</strong></div>)}</div>}{character&&<><div className="playerValueGrid">{characterSheetValues(sheetSchema,character.values,c).map(field=><div key={field.id}><small>{field.label}</small><b>{field.value}</b></div>)}</div>{character.traits.length>0&&<div className="traitList">{characterSheetTraits(sheetSchema,character.values,character.traits).map(value=><span className="tag" key={value}>{c(value)}</span>)}</div>}</>}<section className="sheetInventory" id="player-inventory"><div className="cockpitSectionTitle"><h3>{t("player.inventory")}</h3><span>{actor?.inventory?.reduce((sum,item)=>sum+item.quantity,0)??0}</span></div>{actor?.inventory?.length?actor.inventory.map(item=><div className="inventoryRow" key={item.itemId}><span className="itemIcon">◆</span><span>{c(defs.items[item.itemId]?.label??item.itemId)}</span><b>×{item.quantity}</b></div>):<p className="muted">{t("player.empty")}</p>}</section>{actor?.effects.length?<div className="traitList">{actor.effects.map(effect=><span className="tag" key={effect.id}>{c(defs.effects?.[effect.definitionId]?.label??effect.definitionId)}{effect.remaining!==undefined?` · ${effect.remaining}`:""}</span>)}</div>:null}</aside>
      <footer className="playerActionTray">
        <button className={`playerD20${rolling?" rolling":""}`} disabled={!current||rolling} aria-label={current?t("player.roll"):t("player.noCheck")} onClick={()=>current&&void roll(current)}><span>{shownResolution?.total??shownResolution?.roll?.total??20}</span><small>{shownDice}</small></button>
        <div className={current?"checkPrompt urgent":"checkPrompt"}><p className="eyebrow">{current?t("player.action"):shownResolution?.outcome?c(shownResolution.outcome):t("player.dice")}</p><strong>{current?c(defs.checks[current.request.checkId]?.label??current.request.checkId):shownCheckId?c(defs.checks[shownCheckId]?.label??shownCheckId):t("player.noCheck")}</strong>{current?.request.difficulty!==undefined&&<small>{t("player.difficulty")}: {current.request.difficulty}</small>}{encounter&&<small>{t("player.round")} {encounter.round} · {encounter.currentActorId===participant.id?t("player.yourTurn"):t("player.otherTurn")}</small>}</div>
        <div className="playerPrimaryActions">{actionEntries.slice(0,3).map(([id,value])=><button key={id} className={playerActionId===id?"selected secondary":"secondary"} onClick={()=>{setPlayerActionId(id);setPlayerTargetIds([])}}><span>◇</span>{c(value.label)}</button>)}<button className="secondary" onClick={()=>document.getElementById("player-inventory")?.scrollIntoView({behavior:"smooth",block:"center"})}><span>▣</span>{t("player.inventory")}</button></div>
        {actor&&playerAction&&<div className="playerActionConfig" id="player-abilities"><label>{t("player.ability")}<select value={playerActionId} onChange={event=>{setPlayerActionId(event.target.value);setPlayerTargetIds([])}}>{actionEntries.map(([id,value])=><option key={id} value={id}>{c(value.label)}</option>)}</select></label>{playerTargetPolicy==="single-actor"&&<label>{t("player.target")}<select aria-label={t("player.target")} value={playerTargetIds[0]??""} onChange={event=>setPlayerTargetIds(event.target.value?[event.target.value]:[])}><option value="">{c("Choose…")}</option>{targetChoices.map(value=><option key={value.id} value={value.id}>{value.name}</option>)}</select></label>}{playerTargetPolicy==="multiple-actors"&&<label>{t("player.targets")}<select multiple aria-label={t("player.targets")} value={playerTargetIds} onChange={event=>setPlayerTargetIds(Array.from(event.currentTarget.selectedOptions,value=>value.value))}>{targetChoices.map(value=><option key={value.id} value={value.id}>{value.name}</option>)}</select></label>}<label>{t("player.difficulty")}<input type="number" value={actionDifficulty} onChange={event=>setActionDifficulty(Number(event.target.value))}/></label><button disabled={acting||playerTargetPolicy==="single-actor"&&!playerTargetIds.length||playerTargetPolicy==="multiple-actors"&&!playerTargetIds.length} onClick={()=>void useAction()}>{t("player.use",{action:c(playerAction.label)})}</button></div>}
      </footer>
    </main>
  </section>;
}
