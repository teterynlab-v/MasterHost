import React, { useEffect, useState } from "react";
import { currentRealm, realmHeaders } from "./realm.js";
import { sessionSocket } from "./session-client.js";
import type { ConnectionStatus } from "./session-client.js";
import {AdvancedSessionPanel} from "./advanced-session.js";
import{gmWorkspaces,initialGmWorkspace}from"./gm-workspace.js";import type{GmWorkspace}from"./gm-workspace.js";import{LanguageSwitcher,useI18n}from"./i18n/react.js";

const API = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? "http://localhost:8080/api";
type Participant = { id: string; displayName: string; accessToken?: string;ready?:boolean;characterId?:string };
type Actor = { actorId: string; kind?: "npc"; label?: string; templateId?:string; worldEntityId?: string; worldEntityPath?:string;worldEntityLabel?:string;worldEntityRevision?:number;worldEntityStatus?:"current"|"missing"|"incompatible"; attributes?:Record<string,number>; resources: Record<string, number>; effects: { id: string; definitionId: string; remaining?: number }[];inventory?:{itemId:string;quantity:number}[];progression?:Record<string,number>;locationId?:string };
type Encounter = { id: string; state: "live" | "ended"; orderingPolicy: string; participants: string[]; order: string[]; currentActorId?: string; round: number; turn: number };
type Definitions = { checks: Record<string, { label: string;dice?:string }>; actions: Record<string, { label: string; target: string }>; items:Record<string,{label:string}>;progression:Record<string,{label:string}>;locations:{worldEntityKinds:string[]};actorTemplates: Record<string, { label: string; attributes?:Record<string,number>; worldEntityKinds?: string[] }>; encounter: { orderingPolicy: string } };
type WorldActor = { id: string; kind: string; name: string; materializationPath: string };
type GameEvent = { id: string; sequence: number; type: string; createdAt: string };
type PendingCheck = { request: { id: string; checkId: string; difficulty?: number }; resolution: CheckResolution | null };
type CheckResolution = { checkId?:string; outcome?: "critical-success"|"success" | "failure"|"critical-failure"; total?: number; modifier?: number; roll?: { total: number } };
type SessionContext={session:{id:string;state:string;startedAt?:string};campaign:{id:string;name:string};world:{id:string;name:string;revision:number};pack:{id:string;name:string;version:string};media?:Partial<Record<"map"|"portrait"|"background"|"token"|"item"|"location",string>>};
type SheetSchema={steps:{fields:{id:string;label:string;type:string;options?:{value:string;label:string}[]}[]}[]};
export function characterSheetValues(schema:SheetSchema|undefined,values:Record<string,unknown>){return schema?.steps.flatMap(step=>step.fields).filter(field=>field.id!=="name"&&field.type!=="asset"&&values[field.id]!==undefined).map(field=>({id:field.id,label:field.label,value:field.options?.find(option=>option.value===values[field.id])?.label??String(values[field.id])}))??Object.entries(values).map(([id,value])=>({id,label:id,value:String(value)}))}
type Character={displayName:string;values:Record<string,unknown>;traits:string[];assets:Record<string,unknown>};
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
const nameOf = (id: string | undefined, participants: Participant[], actors: Actor[]) => actors.find(actor => actor.actorId === id)?.label ?? participants.find(participant => participant.id === id)?.displayName ?? "Unknown actor";
function ConnectionBadge({status}:{status:ConnectionStatus}){const{t}=useI18n();const label=status==="live"?t("common.connected"):status==="offline"?t("common.offline"):status==="recovering"?t("common.reconnecting"):status==="connecting"?t("common.connecting"):t("common.disconnected");return <span className={`connection ${status}`} role="status">● {label}</span>}
function NpcEditor({actor,template,busy,inEncounter,onEdit,onRemove}:{actor:Actor;template?:Definitions["actorTemplates"][string];busy:boolean;inEncounter:boolean;onEdit:(label:string,attributes:Record<string,number>)=>Promise<void>;onRemove:()=>Promise<void>}){
 const[label,setLabel]=useState(actor.label??"NPC"),[attributes,setAttributes]=useState<Record<string,number>>(actor.attributes??{});useEffect(()=>{setLabel(actor.label??"NPC");setAttributes(actor.attributes??{})},[actor.label,JSON.stringify(actor.attributes)]);
 return <div className="npcEditor"><label>NPC name<input value={label} maxLength={80} onChange={event=>setLabel(event.target.value)}/></label>{Object.keys(template?.attributes??{}).map(key=><label key={key}>{key}<input type="number" value={attributes[key]??0} onChange={event=>setAttributes({...attributes,[key]:Number(event.target.value)})}/></label>)}<div className="actions"><button className="secondary" disabled={busy||!label.trim()} onClick={()=>void onEdit(label.trim(),attributes)}>SAVE NPC</button><button className="secondary" disabled={busy||inEncounter} title={inEncounter?"Remove from the active Encounter first":undefined} onClick={()=>void onRemove()}>DELETE NPC</button></div></div>
}

export function GmGame({ session, participants, gmToken,worldId,worldName,campaignName,onOpenPlayer,onRemoveParticipant }: { session: { id: string;pin?:string }; participants: Participant[]; gmToken: string;worldId?:string;worldName?:string;campaignName?:string;onOpenPlayer?:()=>void;onRemoveParticipant?:(participantId:string)=>Promise<void> }) {
  const{t}=useI18n();
  const [defs, setDefs] = useState<Definitions>({ checks: {}, actions: {},items:{},progression:{},locations:{worldEntityKinds:[]}, actorTemplates: {}, encounter: { orderingPolicy: "none" } });
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
  const available = actors.map(actor => ({ id: actor.actorId, displayName: nameOf(actor.actorId, participants, actors) }));
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
  const labels:Record<GmWorkspace,string>={table:t("gm.table"),checks:t("gm.checks"),encounter:t("gm.encounter"),party:t("gm.party"),journal:t("gm.journal")};
  return <section className="gmConsole">
    <header className="cockpitTopbar"><div className="cockpitBrand"><span className="brandMark">M</span><b>MasterHost</b></div><div className="cockpitCampaign"><small>{worldName}</small><strong>{campaignName??t("gm.console")}</strong></div><ConnectionBadge status={connection}/>{session.pin&&<span className="cockpitCode">{t("lobby.code")}: <b>{session.pin}</b></span>}<LanguageSwitcher/></header>
    {workspace!=="table"&&<nav className="workspaceNav" aria-label={t("gm.console")}>{gmWorkspaces.map(value=><button key={value} className={workspace===value?"selected secondary":"secondary"} aria-current={workspace===value?"page":undefined} onClick={()=>setWorkspace(value)}>{labels[value]}</button>)}</nav>}
    {error && <p className="error" role="alert">{error}</p>}
    <div hidden={workspace!=="table"} className="gmCockpitBody"><AdvancedSessionPanel sessionId={session.id} token={gmToken} gm actors={actors.map(actor=>({...actor,label:nameOf(actor.actorId,participants,actors)}))} worldId={worldId} onOpenChecks={()=>setWorkspace("checks")} onOpenEncounter={()=>setWorkspace("encounter")}/><aside className="gmPlayersDock"><div className="titleRow"><div><p className="eyebrow">{t("lobby.players",{count:participants.length})}</p></div>{onOpenPlayer&&<button className="secondary compactButton" onClick={onOpenPlayer}>＋</button>}</div>{participants.length===0?<p className="muted">{t("lobby.empty")}</p>:participants.map(participant=><div className="playerDockRow" key={participant.id}><span className="avatar">{participant.displayName.slice(0,2).toUpperCase()}</span><span><b>{participant.displayName}</b><small><i className="presenceDot"/>{participant.characterId?t("player.joined"):t("lobby.choosingCharacter")}</small></span>{onRemoveParticipant&&<button className="iconButton" title={t("lobby.removePlayer")} onClick={()=>void onRemoveParticipant(participant.id)}>⋯</button>}</div>)}<h3 className="dockSubheading">NPC</h3>{actors.filter(actor=>actor.kind==="npc").slice(0,5).map(actor=><div className="playerDockRow" key={actor.actorId}><span className="avatar npcAvatar">{(actor.label??"NPC").slice(0,2).toUpperCase()}</span><span><b>{actor.label??"NPC"}</b><small>{actor.locationId?locations.find(value=>value.id===actor.locationId)?.name??t("player.location"):t("gm.live")}</small></span></div>)}</aside></div>
    {workspace==="party"&&<><div className="workspaceIntro"><div><h3>{t("gm.party")}</h3><p>{t("gm.partyHelp")}</p></div></div>
    <button className="secondary" disabled={busy || participants.length === 0} onClick={() => void run(async () => {
      for (const participant of participants) if (!actors.some(actor => actor.actorId === participant.id)) await authorizedPost(`/sessions/${session.id}/participants/${participant.id}/initialize`, {}, gmToken);
    })}>Initialize party runtime</button>
    {templateId && <div className="actions"><label>NPC template<select value={templateId} onChange={event => { setTemplateId(event.target.value); setWorldEntityId(""); }}>{Object.entries(defs.actorTemplates).map(([id, template]) => <option key={id} value={id}>{template.label}</option>)}</select></label><label>World entity (optional)<select value={worldEntityId} onChange={event => setWorldEntityId(event.target.value)}><option value="">Session NPC</option>{eligibleWorldActors.map(entity => <option key={entity.id} value={entity.id}>{entity.name} · {entity.kind}</option>)}</select></label><button className="secondary" disabled={busy} onClick={() => void run(async () => { await authorizedPost(`/sessions/${session.id}/actors`, { templateId, ...(worldEntityId ? { worldEntityId } : {}) }, gmToken); setWorldEntityId(""); })}>ADD NPC</button><button className="secondary" disabled={busy||!actors.some(actor=>actor.worldEntityId)} onClick={()=>void run(()=>authorizedPost(`/sessions/${session.id}/actors/reconcile-world`,{},gmToken))}>RECONCILE WORLD LINKS</button></div>}
    <h3>Actors</h3>
    {[...participants.map(participant => ({ id: participant.id, name: participant.displayName })), ...actors.filter(actor => actor.kind === "npc").map(actor => ({ id: actor.actorId, name: actor.label ?? "NPC" }))].map(entry => {
      const actor = actors.find(value => value.actorId === entry.id);
      return <article key={entry.id}><h3>{entry.name}</h3>
        {actor?.worldEntityId && <small>World entity: {actor.worldEntityLabel??worldActors.find(entity => entity.id === actor.worldEntityId)?.name??actor.worldEntityId} · {actor.worldEntityStatus??"unreconciled"}{actor.worldEntityRevision!==undefined?` at r${actor.worldEntityRevision}`:""}</small>}
        {actor ? Object.entries(actor.resources).map(([key, value]) => <div className="row" key={key}><b>{key}</b><span>{value}</span></div>) : <p className="muted">Not initialized</p>}
        {actor?.effects.map(effect => <small key={effect.id}>Effect: {effect.definitionId}{effect.remaining !== undefined ? ` (${effect.remaining})` : ""}</small>)}
        {actor?.inventory?.map(item=><small key={item.itemId}>Item: {defs.items[item.itemId]?.label??item.itemId} × {item.quantity}</small>)}
        {Object.entries(actor?.progression??{}).map(([id,value])=><small key={id}>{defs.progression[id]?.label??id}: {value}</small>)}
        {actor?.locationId&&<small>Location: {locations.find(value=>value.id===actor.locationId)?.name??actor.locationId}</small>}
        {actor?.kind==="npc"&&<NpcEditor actor={actor} template={actor.templateId?defs.actorTemplates[actor.templateId]:undefined} busy={busy} inEncounter={Boolean(activeEncounter?.participants.includes(actor.actorId))} onEdit={(label,attributes)=>run(()=>authorizedPost(`/sessions/${session.id}/actors/${actor.actorId}/edit`,{label,attributes},gmToken))} onRemove={()=>run(()=>authorizedPost(`/sessions/${session.id}/actors/${actor.actorId}/remove`,{},gmToken))}/>}
      </article>;
    })}
    <h3>Inventory, progression and location</h3>
    <label>Actor<select value={actorId} onChange={event=>setActorId(event.target.value)}>{available.map(actor=><option key={actor.id} value={actor.id}>{actor.displayName}</option>)}</select></label>
    {itemId&&<><label>Loot<select value={itemId} onChange={event=>setItemId(event.target.value)}>{Object.entries(defs.items).map(([id,item])=><option key={id} value={id}>{item.label}</option>)}</select></label><label>Quantity<input type="number" min="1" value={quantity} onChange={event=>setQuantity(Number(event.target.value))}/></label><button disabled={busy||!actorId} onClick={()=>void run(()=>authorizedPost(`/sessions/${session.id}/items/grant`,{actorId,itemId,quantity},gmToken))}>GRANT LOOT</button></>}
    {progressionId&&<><label>Progression<select value={progressionId} onChange={event=>setProgressionId(event.target.value)}>{Object.entries(defs.progression).map(([id,value])=><option key={id} value={id}>{value.label}</option>)}</select></label><button disabled={busy||!actorId} onClick={()=>void run(()=>authorizedPost(`/sessions/${session.id}/progression`,{actorId,progressionId,amount:quantity},gmToken))}>AWARD</button></>}
    {locations.length>0&&<><label>Location<select value={locationId} onChange={event=>setLocationId(event.target.value)}><option value="">Choose…</option>{locations.map(location=><option key={location.id} value={location.id}>{location.name}</option>)}</select></label><div className="actions"><button disabled={busy||!actorId||!locationId} onClick={()=>void run(()=>authorizedPost(`/sessions/${session.id}/location`,{actorId,locationId},gmToken))}>MOVE ACTOR</button><button className="secondary" disabled={busy||!locationId||!actors.length} onClick={()=>void run(()=>authorizedPost(`/sessions/${session.id}/travel`,{actorIds:actors.map(actor=>actor.actorId),locationId},gmToken))}>TRAVEL PARTY</button></div></>}
    </>}
    {workspace==="checks"&&<><div className="workspaceIntro"><div><h3>{t("gm.checks")}</h3><p>{t("gm.checksHelp")}</p></div>{activeEncounter&&<button className="secondary" onClick={()=>setWorkspace("encounter")}>{t("gm.openEncounter")}</button>}</div>
    <h3>Request check</h3>
    <label>Player<select value={checkParticipantId} onChange={event => setCheckParticipantId(event.target.value)}>{availablePlayers.map(participant => <option key={participant.id} value={participant.id}>{participant.displayName}</option>)}</select></label>
    <label>Check<select value={checkId} onChange={event => setCheckId(event.target.value)}>{Object.entries(defs.checks).map(([id, check]) => <option key={id} value={id}>{check.label}</option>)}</select></label>
    <label>{t("player.difficulty")}<input type="number" value={difficulty} onChange={event => setDifficulty(Number(event.target.value))} /></label>
    <label>Player visibility<select value={visibility} onChange={event=>setVisibility(event.target.value)}><option value="full">Full roll and DC</option><option value="result-only">Result, hidden DC</option><option value="roll-only">Roll, hidden outcome and DC</option><option value="hidden">Hidden result and DC</option></select></label>
    <button disabled={busy || !checkParticipantId || !checkId} onClick={() => void run(() => authorizedPost(`/sessions/${session.id}/checks`, { participantId: checkParticipantId, checkId, difficulty, visibility }, gmToken))}>SEND CHECK</button>

    <h3>Action</h3>
    <label>Source actor<select value={actorId} onChange={event => setActorId(event.target.value)}>{available.map(actor => <option key={actor.id} value={actor.id}>{actor.displayName}</option>)}</select></label>
    <label>Action<select value={actionId} onChange={event => setActionId(event.target.value)}>{Object.entries(defs.actions).map(([id, definition]) => <option key={id} value={id}>{definition.label}</option>)}</select></label>
    {targetPolicy === "single-actor" && <label>Target<select value={targetId} onChange={event => setTargetId(event.target.value)}>{available.map(participant => <option key={participant.id} value={participant.id}>{participant.displayName}</option>)}</select></label>}
    {targetPolicy === "multiple-actors" && <fieldset className="choiceList"><legend>{t("player.targets")}</legend>{available.map(participant => <label key={participant.id}><input type="checkbox" checked={targetIds.includes(participant.id)} onChange={() => setTargetIds(ids => toggle(ids, participant.id))} />{participant.displayName}</label>)}</fieldset>}
    <button disabled={busy || !actorId || !actionId || targetPolicy === "single-actor" && !targetId || targetPolicy === "multiple-actors" && !targetIds.length} onClick={() => void run(applyAction)}>APPLY ACTION</button>

    </>}
    {workspace==="encounter"&&<><div className="workspaceIntro"><div><h3>{t("gm.encounter")}</h3><p>{t("gm.encounterHelp")}</p></div></div>
    <h3>Encounter</h3>
    {activeEncounter ? <article>
      <p>Ordering: <b>{activeEncounter.orderingPolicy}</b></p>
      {activeEncounter.currentActorId ? <p>Round {activeEncounter.round} · Turn {activeEncounter.turn} · Current: <b>{nameOf(activeEncounter.currentActorId, participants, actors)}</b></p> : <p>No turn order for this Pack.</p>}
      {activeEncounter.order.length > 0 && <p>Order: {activeEncounter.order.map(id => nameOf(id, participants, actors)).join(" → ")}</p>}
      <p>Participants: {activeEncounter.participants.map(id => nameOf(id, participants, actors)).join(", ")}</p>
      <div className="actions">{available.filter(actor => !activeEncounter.participants.includes(actor.id)).map(actor => <button className="secondary" key={actor.id} disabled={busy} onClick={() => void run(() => authorizedPost(`/encounters/${activeEncounter.id}/participants`, { addActorIds: [actor.id] }, gmToken))}>ADD {actor.displayName}</button>)}</div>
      <div className="actions">{activeEncounter.participants.filter(id => id !== activeEncounter.currentActorId && activeEncounter.participants.length > 1).map(id => <button className="secondary" key={id} disabled={busy} onClick={() => void run(() => authorizedPost(`/encounters/${activeEncounter.id}/participants`, { removeActorIds: [id] }, gmToken))}>REMOVE {nameOf(id, participants, actors)}</button>)}</div>
      <div className="actions">
        {activeEncounter.currentActorId && <button disabled={busy} onClick={() => void run(() => authorizedPost(`/encounters/${activeEncounter.id}/advance`, {}, gmToken))}>END TURN</button>}
        <button className="secondary" disabled={busy} onClick={() => void run(() => authorizedPost(`/encounters/${activeEncounter.id}/end`, {}, gmToken))}>END ENCOUNTER</button>
      </div>
    </article> : <article>
      <p>Ordering policy: <b>{defs.encounter.orderingPolicy}</b></p>
      <button className="secondary" disabled={busy || available.length === 0} onClick={() => setEncounterIds(available.map(participant => participant.id))}>Select all initialized actors</button>
      <fieldset className="choiceList"><legend>Participants</legend>{available.map(participant => <label key={participant.id}><input type="checkbox" checked={encounterIds.includes(participant.id)} onChange={() => setEncounterIds(ids => toggle(ids, participant.id))} />{participant.displayName}{defs.encounter.orderingPolicy === "custom" && encounterIds.includes(participant.id) && <span><button className="tiny" disabled={encounterIds[0] === participant.id} onClick={() => moveEncounter(participant.id, -1)}>↑</button> <button className="tiny" disabled={encounterIds.at(-1) === participant.id} onClick={() => moveEncounter(participant.id, 1)}>↓</button></span>}</label>)}</fieldset>
      <button disabled={busy || encounterIds.length === 0} onClick={() => void run(startEncounter)}>START ENCOUNTER</button>
    </article>}
    </>}
    {workspace==="journal"&&<><div className="workspaceIntro"><div><h3>{t("gm.journal")}</h3><p>{t("gm.journalHelp")}</p></div></div>
    <h3>Session</h3>
    <label>Record event<textarea rows={3} maxLength={1000} value={narrative} onChange={event=>setNarrative(event.target.value)} placeholder="What changed in the fiction?"/></label>
    <button className="secondary" disabled={busy||!narrative.trim()} onClick={()=>void run(async()=>{await authorizedPost(`/sessions/${session.id}/events/narrative`,{text:narrative.trim()},gmToken);setNarrative("")})}>ADD TO SESSION LOG</button>
    <button className="secondary" disabled={busy || Boolean(activeEncounter)} onClick={() => void run(() => authorizedPost(`/sessions/${session.id}/state`, { state: "finished" }, gmToken))}>FINISH SESSION</button>
    {activeEncounter && <p className="muted">End the encounter before finishing the session.</p>}
    <h3>Game log</h3>
    {events.slice(-15).reverse().map(event => <div className="row gameLogRow" key={event.id}><b>#{event.sequence} {event.type}</b><small>{new Date(event.createdAt).toLocaleTimeString()}</small></div>)}
    {playtest&&<details className="technicalEvidence"><summary>{t("gm.devTools")}</summary><p><b>{playtest.durationMinutes} / 120 minutes</b> · {playtest.eventCount} events · {playtest.gatePassed?"gate passed":"gate open"}</p></details>}
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
      if (["check.requested", "check.resolved", "actor.state", "action.resolved", "encounter.state", "session.snapshot", "session.catchup", "session.event"].includes(event.type)) void refresh().catch(failure => setError(String(failure)));
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
  const playerAction=defs.actions[playerActionId],playerTargetPolicy=playerAction?.target==="actor"?"single-actor":playerAction?.target,targetChoices=allActors.map(value=>({id:value.actorId,name:nameOf(value.actorId,party,allActors)}));
  const actionEntries=Object.entries(defs.actions),portrait=context?.media?.portrait,portraitUrl=portrait&&context?`${API}/worlds/${encodeURIComponent(context.world.id)}/pack-assets/${portrait.replace(/^assets\//,"")}?realm=${encodeURIComponent(currentRealm())}`:undefined;
  return <section className="playerCockpit">
    <header className="playerTopbar"><div className="cockpitBrand"><span className="brandMark">M</span><b>MasterHost</b></div><div className="cockpitCampaign"><small>{context?.world.name}</small><strong>{context?.campaign.name??"GAME LIVE"}</strong></div><ConnectionBadge status={connection}/><button className="iconButton" title={t("player.refresh")} onClick={()=>void refresh().catch(failure=>setError(String(failure)))}>↻</button><button className="secondary compactButton" onClick={onLeave}>{t("join.other")}</button></header>
    {error&&<p className="error playerCockpitMessage" role="alert">{error}</p>}
    <main className="playerCockpitBody">
      <section className="playerStage" id="player-map"><div className="partyPortraits" aria-label={t("player.group")}>{party.map(member=><div className={member.id===participant.id?"partyPortrait current":"partyPortrait"} key={member.id}><span>{member.displayName.slice(0,2).toUpperCase()}</span><small>{member.id===participant.id?t("player.you"):member.displayName}</small></div>)}</div><AdvancedSessionPanel sessionId={session.id} token={participant.accessToken} gm={false} variant="player-map" actors={allActors}/></section>
      <aside className="playerSheetPanel" id="player-character">{portraitUrl?<img className="characterPortrait" src={portraitUrl} alt={character?.displayName??t("player.character")} onError={event=>{event.currentTarget.hidden=true}}/>:<div className="characterPortraitFallback">{character?.displayName.slice(0,2).toUpperCase()??"PC"}</div>}<div className="characterIdentity"><p className="eyebrow">{t("player.character")}</p><h2>{character?.displayName??participant.displayName}</h2><small>{locationName??context?.world.name}</small></div>{actor&&<div className="playerResourceGrid">{Object.entries(actor.resources).map(([key,value])=><div key={key}><span>{key}</span><strong>{value}</strong></div>)}</div>}{character&&<><div className="playerValueGrid">{characterSheetValues(sheetSchema,character.values).map(field=><div key={field.id}><small>{field.label}</small><b>{field.value}</b></div>)}</div>{character.traits.length>0&&<div className="traitList">{character.traits.map(value=><span className="tag" key={value}>{value}</span>)}</div>}</>}<section className="sheetInventory" id="player-inventory"><div className="cockpitSectionTitle"><h3>{t("player.inventory")}</h3><span>{actor?.inventory?.reduce((sum,item)=>sum+item.quantity,0)??0}</span></div>{actor?.inventory?.length?actor.inventory.map(item=><div className="inventoryRow" key={item.itemId}><span className="itemIcon">◆</span><span>{defs.items[item.itemId]?.label??item.itemId}</span><b>×{item.quantity}</b></div>):<p className="muted">{t("player.empty")}</p>}</section>{actor?.effects.length?<div className="traitList">{actor.effects.map(effect=><span className="tag" key={effect.id}>{effect.definitionId}{effect.remaining!==undefined?` · ${effect.remaining}`:""}</span>)}</div>:null}</aside>
      <footer className="playerActionTray">
        <button className={`playerD20${rolling?" rolling":""}`} disabled={!current||rolling} aria-label={current?t("player.roll"):t("player.noCheck")} onClick={()=>current&&void roll(current)}><span>{shownResolution?.total??shownResolution?.roll?.total??20}</span><small>{shownDice}</small></button>
        <div className={current?"checkPrompt urgent":"checkPrompt"}><p className="eyebrow">{current?t("player.action"):shownResolution?.outcome?.toUpperCase()??t("player.dice")}</p><strong>{current?(defs.checks[current.request.checkId]?.label??current.request.checkId):shownCheckId?defs.checks[shownCheckId]?.label??shownCheckId:t("player.noCheck")}</strong>{current?.request.difficulty!==undefined&&<small>{t("player.difficulty")}: {current.request.difficulty}</small>}{encounter&&<small>{t("player.round")} {encounter.round} · {encounter.currentActorId===participant.id?t("player.yourTurn"):t("player.otherTurn")}</small>}</div>
        <div className="playerPrimaryActions">{actionEntries.slice(0,3).map(([id,value])=><button key={id} className={playerActionId===id?"selected secondary":"secondary"} onClick={()=>{setPlayerActionId(id);setPlayerTargetIds([])}}><span>◇</span>{value.label}</button>)}<button className="secondary" onClick={()=>document.getElementById("player-inventory")?.scrollIntoView({behavior:"smooth",block:"center"})}><span>▣</span>{t("player.inventory")}</button></div>
        {actor&&playerAction&&<div className="playerActionConfig" id="player-abilities"><label>{t("player.ability")}<select value={playerActionId} onChange={event=>{setPlayerActionId(event.target.value);setPlayerTargetIds([])}}>{actionEntries.map(([id,value])=><option key={id} value={id}>{value.label}</option>)}</select></label>{playerTargetPolicy==="single-actor"&&<label>{t("player.target")}<select aria-label={t("player.target")} value={playerTargetIds[0]??""} onChange={event=>setPlayerTargetIds(event.target.value?[event.target.value]:[])}><option value="">Choose…</option>{targetChoices.map(value=><option key={value.id} value={value.id}>{value.name}</option>)}</select></label>}{playerTargetPolicy==="multiple-actors"&&<label>{t("player.targets")}<select multiple aria-label={t("player.targets")} value={playerTargetIds} onChange={event=>setPlayerTargetIds(Array.from(event.currentTarget.selectedOptions,value=>value.value))}>{targetChoices.map(value=><option key={value.id} value={value.id}>{value.name}</option>)}</select></label>}<label>{t("player.difficulty")}<input type="number" value={actionDifficulty} onChange={event=>setActionDifficulty(Number(event.target.value))}/></label><button disabled={acting||playerTargetPolicy==="single-actor"&&!playerTargetIds.length||playerTargetPolicy==="multiple-actors"&&!playerTargetIds.length} onClick={()=>void useAction()}>{t("player.use",{action:playerAction.label})}</button></div>}
      </footer>
    </main>
  </section>;
}
