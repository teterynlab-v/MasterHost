import React, { useEffect, useState } from "react";
import { sessionSocket } from "./session-client.js";

const API = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? "http://localhost:8080/api";
type Participant = { id: string; displayName: string; accessToken?: string };
type Actor = { actorId: string; kind?: "npc"; label?: string; resources: Record<string, number>; effects: { id: string; definitionId: string; remaining?: number }[] };
type Encounter = { id: string; state: "live" | "ended"; orderingPolicy: string; participants: string[]; order: string[]; currentActorId?: string; round: number; turn: number };
type Definitions = { checks: Record<string, { label: string }>; actions: Record<string, { label: string; target: string }>; actorTemplates: Record<string, { label: string }>; encounter: { orderingPolicy: string } };
type GameEvent = { id: string; sequence: number; type: string; createdAt: string };
type PendingCheck = { request: { id: string; checkId: string; difficulty: number }; resolution: CheckResolution | null };
type CheckResolution = { outcome: "success" | "failure"; total: number; modifier: number; roll: { total: number } };

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, init);
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

export function GmGame({ session, participants, gmToken }: { session: { id: string }; participants: Participant[]; gmToken: string }) {
  const [defs, setDefs] = useState<Definitions>({ checks: {}, actions: {}, actorTemplates: {}, encounter: { orderingPolicy: "none" } });
  const [actorId, setActorId] = useState("");
  const [checkParticipantId, setCheckParticipantId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [targetIds, setTargetIds] = useState<string[]>([]);
  const [checkId, setCheckId] = useState("");
  const [actionId, setActionId] = useState("");
  const [difficulty, setDifficulty] = useState(14);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [encounterIds, setEncounterIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [nextEvents, nextActors, nextEncounters] = await Promise.all([
      call<GameEvent[]>(`/sessions/${session.id}/events`, { headers: headers(gmToken) }),
      call<Actor[]>(`/sessions/${session.id}/actors`, { headers: headers(gmToken) }),
      call<Encounter[]>(`/sessions/${session.id}/encounters`, { headers: headers(gmToken) }),
    ]);
    setEvents(nextEvents); setActors(nextActors); setEncounters(nextEncounters);
  }
  useEffect(() => {
    void call<Definitions>("/game/definitions").then(value => {
      setDefs(value);
      setCheckId(Object.keys(value.checks)[0] ?? "");
      setActionId(Object.keys(value.actions)[0] ?? "");
      setTemplateId(Object.keys(value.actorTemplates)[0] ?? "");
    }).catch(failure => setError(String(failure)));
    void refresh().catch(failure => setError(String(failure)));
  }, [session.id]);
  useEffect(() => {
    const socket = sessionSocket(session.id, gmToken, event => {
      if (["check.requested", "check.resolved", "actor.state", "action.resolved", "encounter.state"].includes(event.type)) void refresh().catch(failure => setError(String(failure)));
    });
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
  return <section>
    <h2>GAME LIVE</h2>
    {error && <p className="error" role="alert">{error}</p>}
    <button className="secondary" disabled={busy || participants.length === 0} onClick={() => void run(async () => {
      for (const participant of participants) if (!actors.some(actor => actor.actorId === participant.id)) await authorizedPost(`/sessions/${session.id}/participants/${participant.id}/initialize`, {}, gmToken);
    })}>Initialize party runtime</button>
    {templateId && <div className="actions"><label>NPC template<select value={templateId} onChange={event => setTemplateId(event.target.value)}>{Object.entries(defs.actorTemplates).map(([id, template]) => <option key={id} value={id}>{template.label}</option>)}</select></label><button className="secondary" disabled={busy} onClick={() => void run(() => authorizedPost(`/sessions/${session.id}/actors`, { templateId }, gmToken))}>ADD NPC</button></div>}
    <h3>Actors</h3>
    {[...participants.map(participant => ({ id: participant.id, name: participant.displayName })), ...actors.filter(actor => actor.kind === "npc").map(actor => ({ id: actor.actorId, name: actor.label ?? "NPC" }))].map(entry => {
      const actor = actors.find(value => value.actorId === entry.id);
      return <article key={entry.id}><h3>{entry.name}</h3>
        {actor ? Object.entries(actor.resources).map(([key, value]) => <div className="row" key={key}><b>{key}</b><span>{value}</span></div>) : <p className="muted">Not initialized</p>}
        {actor?.effects.map(effect => <small key={effect.id}>Effect: {effect.definitionId}{effect.remaining !== undefined ? ` (${effect.remaining})` : ""}</small>)}
      </article>;
    })}
    <h3>Request check</h3>
    <label>Player<select value={checkParticipantId} onChange={event => setCheckParticipantId(event.target.value)}>{availablePlayers.map(participant => <option key={participant.id} value={participant.id}>{participant.displayName}</option>)}</select></label>
    <label>Check<select value={checkId} onChange={event => setCheckId(event.target.value)}>{Object.entries(defs.checks).map(([id, check]) => <option key={id} value={id}>{check.label}</option>)}</select></label>
    <label>Difficulty<input type="number" value={difficulty} onChange={event => setDifficulty(Number(event.target.value))} /></label>
    <button disabled={busy || !checkParticipantId || !checkId} onClick={() => void run(() => authorizedPost(`/sessions/${session.id}/checks`, { participantId: checkParticipantId, checkId, difficulty, visibility: "full" }, gmToken))}>SEND CHECK</button>

    <h3>Action</h3>
    <label>Source actor<select value={actorId} onChange={event => setActorId(event.target.value)}>{available.map(actor => <option key={actor.id} value={actor.id}>{actor.displayName}</option>)}</select></label>
    <label>Action<select value={actionId} onChange={event => setActionId(event.target.value)}>{Object.entries(defs.actions).map(([id, definition]) => <option key={id} value={id}>{definition.label}</option>)}</select></label>
    {targetPolicy === "single-actor" && <label>Target<select value={targetId} onChange={event => setTargetId(event.target.value)}>{available.map(participant => <option key={participant.id} value={participant.id}>{participant.displayName}</option>)}</select></label>}
    {targetPolicy === "multiple-actors" && <fieldset className="choiceList"><legend>Targets</legend>{available.map(participant => <label key={participant.id}><input type="checkbox" checked={targetIds.includes(participant.id)} onChange={() => setTargetIds(ids => toggle(ids, participant.id))} />{participant.displayName}</label>)}</fieldset>}
    <button disabled={busy || !actorId || !actionId || targetPolicy === "single-actor" && !targetId || targetPolicy === "multiple-actors" && !targetIds.length} onClick={() => void run(applyAction)}>APPLY ACTION</button>

    <h3>Encounter</h3>
    {activeEncounter ? <article>
      <p>Ordering: <b>{activeEncounter.orderingPolicy}</b></p>
      {activeEncounter.currentActorId ? <p>Round {activeEncounter.round} · Turn {activeEncounter.turn} · Current: <b>{nameOf(activeEncounter.currentActorId, participants, actors)}</b></p> : <p>No turn order for this Pack.</p>}
      {activeEncounter.order.length > 0 && <p>Order: {activeEncounter.order.map(id => nameOf(id, participants, actors)).join(" → ")}</p>}
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
    <h3>Session</h3>
    <button className="secondary" disabled={busy || Boolean(activeEncounter)} onClick={() => void run(() => authorizedPost(`/sessions/${session.id}/state`, { state: "finished" }, gmToken))}>FINISH SESSION</button>
    {activeEncounter && <p className="muted">End the encounter before finishing the session.</p>}
    <h3>Game log</h3>
    {events.slice(-15).reverse().map(event => <div className="row gameLogRow" key={event.id}><b>#{event.sequence} {event.type}</b><small>{new Date(event.createdAt).toLocaleTimeString()}</small></div>)}
  </section>;
}

export function PlayerGame({ session, participant, onLeave }: { session: { id: string }; participant: Participant & { accessToken: string }; onLeave: () => void }) {
  const [pending, setPending] = useState<PendingCheck[]>([]);
  const [last, setLast] = useState<{ resolution: CheckResolution }>();
  const [actor, setActor] = useState<Actor>();
  const [encounter, setEncounter] = useState<Encounter>();
  const [error, setError] = useState("");
  async function refresh() {
    const [checks, actors, encounters] = await Promise.all([
      call<PendingCheck[]>(`/sessions/${session.id}/participants/${participant.id}/checks`, { headers: headers(participant.accessToken) }),
      call<Actor[]>(`/sessions/${session.id}/actors`, { headers: headers(participant.accessToken) }),
      call<Encounter[]>(`/sessions/${session.id}/encounters`, { headers: headers(participant.accessToken) }),
    ]);
    setPending(checks); setActor(actors.find(value => value.actorId === participant.id)); setEncounter(encounters.find(value => value.state === "live"));
  }
  useEffect(() => { void refresh().catch(failure => setError(String(failure))); }, [session.id, participant.id]);
  useEffect(() => {
    const socket = sessionSocket(session.id, participant.accessToken, event => {
      if (["check.requested", "check.resolved", "actor.state", "action.resolved", "encounter.state"].includes(event.type)) void refresh().catch(failure => setError(String(failure)));
    });
    return () => socket.close();
  }, [session.id, participant.id, participant.accessToken]);
  async function roll(check: PendingCheck) {
    try { const resolution = await authorizedPost<CheckResolution>(`/checks/${check.request.id}/roll`, {}, participant.accessToken); setLast({ resolution }); setError(""); await refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
  }
  const current = pending.find(check => !check.resolution);
  const shownResolution = last?.resolution ?? pending.find(check => check.resolution)?.resolution;
  return <section>
    <h2>GAME LIVE</h2>
    {error && <p className="error" role="alert">{error}</p>}
    {actor && <article><h3>Resources</h3>{Object.entries(actor.resources).map(([key, value]) => <div className="row" key={key}><b>{key}</b><span>{value}</span></div>)}{actor.effects.map(effect => <small key={effect.id}>{effect.definitionId}{effect.remaining !== undefined ? ` · ${effect.remaining} turns` : ""}</small>)}</article>}
    {encounter && <article><h3>Encounter</h3>{encounter.currentActorId ? <p>Round {encounter.round} · Turn {encounter.turn} · <b>{encounter.currentActorId === participant.id ? "Your turn" : "Another actor's turn"}</b></p> : <p>Active encounter · no turn order</p>}</article>}
    {current ? <article><h3>{current.request.checkId.toUpperCase()}</h3><p>Difficulty: <b>{current.request.difficulty}</b></p><button onClick={() => void roll(current)}>🎲 ROLL</button></article> : <p className="muted">Waiting for the GM…</p>}
    {shownResolution && <article><h3>{shownResolution.outcome.toUpperCase()}</h3><div className="bigRoll">{shownResolution.total}</div><p>Dice {shownResolution.roll.total} + modifier {shownResolution.modifier}</p></article>}
    <button className="secondary" onClick={() => void refresh().catch(failure => setError(String(failure)))}>Refresh state</button> <button className="secondary" onClick={onLeave}>Join another session</button>
  </section>;
}
