import type { ActorRuntimeState } from "./index.js";
import type { Encounter } from "./encounters.js";

export interface ReplayEvent { sequence: number; type: string; payload: Record<string, unknown>; schemaVersion: string }
export interface RuntimeReplay { actors: ActorRuntimeState[]; encounters: Encounter[]; issues: string[] }

const object = (value: unknown, field: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error(`invalid ${field}`);
  return value as Record<string, unknown>;
};
const string = (value: unknown, field: string): string => {
  if (typeof value !== "string" || !value) throw Error(`invalid ${field}`);
  return value;
};
const number = (value: unknown, field: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) throw Error(`invalid ${field}`);
  return value;
};
const strings = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value) || value.some(item => typeof item !== "string")) throw Error(`invalid ${field}`);
  return value;
};

export function replayRuntimeEvents(events: ReplayEvent[], initial?: { actors: ActorRuntimeState[]; encounters: Encounter[]; lastSequence: number }): RuntimeReplay {
  const actors = new Map((initial?.actors ?? []).map(actor => [actor.actorId, structuredClone(actor)]));
  const encounters = new Map((initial?.encounters ?? []).map(encounter => [encounter.id, structuredClone(encounter)]));
  const issues: string[] = [];
  let previous = initial?.lastSequence ?? 0;
  for (const event of events) {
    if (!Number.isSafeInteger(event.sequence) || event.sequence <= previous) { issues.push(`event sequence ${event.sequence} is out of order`); continue; }
    previous = event.sequence;
    if (event.schemaVersion !== "1") { issues.push(`event ${event.sequence} has unsupported schema ${event.schemaVersion}`); continue; }
    try {
      const payload = object(event.payload, "event payload");
      if (event.type === "ActorInitialized") {
        const actorId = string(payload.actorId, "actor ID");
        if (actors.has(actorId)) throw Error(`actor ${actorId} initialized twice`);
        const resources = object(payload.resources, "actor resources");
        for (const [id, value] of Object.entries(resources)) number(value, `resource ${id}`);
        if (!Array.isArray(payload.effects)) throw Error("invalid actor effects");
        actors.set(actorId, structuredClone(payload as unknown as ActorRuntimeState));
      } else if (event.type === "ActorUpdated" || event.type === "ActorWorldLinkReconciled") {
        const next=object(payload.actor,"actor") as unknown as ActorRuntimeState,actorId=string(next.actorId,"actor ID");
        if(!actors.has(actorId)||next.kind!=="npc"||typeof next.label!=="string"||!next.label)throw Error(`invalid update for actor ${actorId}`);
        const resources=object(next.resources,"actor resources"),attributes=object(next.attributes??{},"actor attributes");for(const[id,value]of[...Object.entries(resources),...Object.entries(attributes)])number(value,`actor value ${id}`);
        if(event.type==="ActorWorldLinkReconciled"){string(next.worldEntityId,"World entity ID");number(next.worldEntityRevision,"World revision");if(!["current","missing","incompatible"].includes(String(next.worldEntityStatus)))throw Error("invalid World entity status");if(next.worldEntityStatus!=="missing"){string(next.worldEntityPath,"World entity path");string(next.worldEntityLabel,"World entity label")}}
        if(!Array.isArray(next.effects))throw Error("invalid actor effects");actors.set(actorId,structuredClone(next));
      } else if (event.type === "ActorRemoved") {
        const actorId=string(payload.actorId,"actor ID"),actor=actors.get(actorId);if(!actor||actor.kind!=="npc")throw Error(`cannot remove actor ${actorId}`);actors.delete(actorId);
      } else if (event.type === "ResourceChanged") {
        const actorId = string(payload.actorId, "actor ID"), actor = actors.get(actorId);
        if (!actor) throw Error(`resource change for unknown actor ${actorId}`);
        actor.resources[string(payload.resource, "resource ID")] = number(payload.after, "resource value");
      } else if (event.type === "EffectApplied") {
        const actorId = string(payload.actorId, "actor ID"), actor = actors.get(actorId);
        if (!actor) throw Error(`effect for unknown actor ${actorId}`);
        const effect = object(payload.effect, "effect");
        string(effect.id, "effect ID");
        actor.effects.push(structuredClone(effect) as unknown as ActorRuntimeState["effects"][number]);
      } else if (event.type === "EffectTicked") {
        const actorId = string(payload.actorId, "actor ID"), actor = actors.get(actorId);
        const effect = actor?.effects.find(value => value.id === payload.effectId);
        if (!effect) throw Error(`tick for unknown effect ${String(payload.effectId)}`);
        effect.remaining = number(payload.remaining, "effect duration");
      } else if (event.type === "EffectExpired") {
        const actorId = string(payload.actorId, "actor ID"), actor = actors.get(actorId);
        if (!actor || !actor.effects.some(value => value.id === payload.effectId)) throw Error(`expiry for unknown effect ${String(payload.effectId)}`);
        actor.effects = actor.effects.filter(value => value.id !== payload.effectId);
      } else if(event.type==="ItemGranted"){
        const actorId=string(payload.actorId,"actor ID"),actor=actors.get(actorId),itemId=string(payload.itemId,"item ID"),after=number(payload.after,"item quantity");if(!actor||!Number.isSafeInteger(after)||after<=0)throw Error("invalid item grant");actor.inventory=(actor.inventory??[]).filter(value=>value.itemId!==itemId);actor.inventory.push({itemId,quantity:after});
      } else if(event.type==="ItemTransferred"){
        const from=actors.get(string(payload.fromActorId,"source actor ID")),to=actors.get(string(payload.toActorId,"target actor ID")),itemId=string(payload.itemId,"item ID"),fromAfter=number(payload.fromAfter,"source item quantity"),toAfter=number(payload.toAfter,"target item quantity");if(!from||!to||!Number.isSafeInteger(fromAfter)||fromAfter<0||!Number.isSafeInteger(toAfter)||toAfter<=0)throw Error("invalid item transfer");from.inventory=(from.inventory??[]).filter(value=>value.itemId!==itemId);if(fromAfter)from.inventory.push({itemId,quantity:fromAfter});to.inventory=(to.inventory??[]).filter(value=>value.itemId!==itemId);to.inventory.push({itemId,quantity:toAfter});
      } else if(event.type==="ProgressionChanged"){
        const actor=actors.get(string(payload.actorId,"actor ID")),progressionId=string(payload.progressionId,"progression ID"),after=number(payload.after,"progression value");if(!actor)throw Error("progression for unknown actor");actor.progression={...(actor.progression??{}),[progressionId]:after};
      } else if(event.type==="ActorMoved"){
        const actor=actors.get(string(payload.actorId,"actor ID"));if(!actor)throw Error("move for unknown actor");actor.locationId=string(payload.toLocationId,"location ID");
      } else if (event.type === "EncounterStarted") {
        const id = string(payload.encounterId, "encounter ID"), sessionId = string(payload.sessionId, "session ID");
        if (encounters.has(id)) throw Error(`encounter ${id} started twice`);
        const participants = strings(payload.participants, "encounter participants");
        const policy = string(payload.orderingPolicy, "ordering policy") as Encounter["orderingPolicy"];
        encounters.set(id, { id, sessionId, state: "live", participants, orderingPolicy: policy, order: [], currentActorId: undefined, round: 0, turn: 0 });
      } else if (event.type === "EncounterParticipantsChanged") {
        const id = string(payload.encounterId, "encounter ID"), encounter = encounters.get(id);
        if (!encounter || encounter.state !== "live") throw Error(`participant change for inactive encounter ${id}`);
        const added = strings(payload.addedActorIds, "added actor IDs"), removed = strings(payload.removedActorIds, "removed actor IDs");
        if ((!added.length && !removed.length) || new Set(added).size !== added.length || new Set(removed).size !== removed.length || added.some(actorId => encounter.participants.includes(actorId) || removed.includes(actorId)) || removed.some(actorId => !encounter.participants.includes(actorId))) throw Error("invalid encounter participant change");
        const participants = strings(payload.participants, "encounter participants"), order = strings(payload.order, "encounter order");
        const expectedParticipants = [...encounter.participants.filter(actorId => !removed.includes(actorId)), ...added];
        const expectedOrder = encounter.orderingPolicy === "none" ? [] : [...encounter.order.filter(actorId => !removed.includes(actorId)), ...added];
        if (!participants.length || new Set(participants).size !== participants.length || participants.length !== expectedParticipants.length || participants.some((actorId, index) => actorId !== expectedParticipants[index]) || order.length !== expectedOrder.length || order.some((actorId, index) => actorId !== expectedOrder[index])) throw Error("invalid encounter participant order");
        if (encounter.currentActorId && removed.includes(encounter.currentActorId)) throw Error("current actor removed from encounter");
        encounter.participants = participants;
        encounter.order = order;
      } else if (["OrderEstablished", "RoundStarted", "TurnStarted", "EncounterEnded"].includes(event.type)) {
        const id = string(payload.encounterId, "encounter ID"), encounter = encounters.get(id);
        if (!encounter) throw Error(`event for unknown encounter ${id}`);
        if (event.type === "OrderEstablished") encounter.order = strings(payload.order, "encounter order");
        if (event.type === "RoundStarted") encounter.round = number(payload.round, "round");
        if (event.type === "TurnStarted") { encounter.currentActorId = string(payload.actorId, "current actor"); encounter.turn = number(payload.turn, "turn"); }
        if (event.type === "EncounterEnded") { encounter.state = "ended"; encounter.currentActorId = undefined; }
      } else if (!["CheckRequested", "DiceRolled", "CheckResolved", "ActionRequested", "ActionResolved", "TurnEnded", "RoundEnded"].includes(event.type)) {
        issues.push(`event ${event.sequence} has unsupported type ${event.type}`);
      }
    } catch (failure) {
      issues.push(`event ${event.sequence}: ${failure instanceof Error ? failure.message : String(failure)}`);
    }
  }
  return { actors: [...actors.values()], encounters: [...encounters.values()], issues };
}
