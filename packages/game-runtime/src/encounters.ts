import { randomUUID } from "node:crypto";
import { rollDice } from "./index.js";
import type { ActiveEffect, ActorRuntimeState, EffectDefinition } from "./index.js";

export type OrderingPolicy = "none" | "fixed" | "rolled" | "attribute" | "custom";
export interface Encounter { id: string; sessionId: string; state: "live" | "ended"; participants: string[]; orderingPolicy: OrderingPolicy; order: string[]; currentActorId?: string; round: number; turn: number }
export interface EncounterEvent { type: "EncounterStarted" | "OrderEstablished" | "RoundStarted" | "TurnStarted" | "TurnEnded" | "RoundEnded" | "EncounterEnded" | "EffectTicked" | "EffectExpired"; payload: Record<string, unknown> }
const event = (type: EncounterEvent["type"], encounter: Encounter, extra: Record<string, unknown> = {}): EncounterEvent => ({ type, payload: { sessionId: encounter.sessionId, encounterId: encounter.id, ...extra } });

export function startEncounter(input: { sessionId: string; participantIds: string[]; policy: OrderingPolicy; attributes?: Record<string, number>; customOrder?: string[]; roller?: (sides: number) => number; id?: string }): { encounter: Encounter; events: EncounterEvent[] } {
  const participants = [...input.participantIds];
  if (!participants.length || new Set(participants).size !== participants.length) throw Error("encounter needs unique participants");
  let order = [...participants];
  if (input.policy === "custom") {
    if (!input.customOrder || input.customOrder.length !== participants.length || new Set(input.customOrder).size !== participants.length || input.customOrder.some(id => !participants.includes(id))) throw Error("custom order must contain every participant exactly once");
    order = [...input.customOrder];
  } else if (input.policy === "attribute") {
    for (const id of participants) if (!Number.isFinite(input.attributes?.[id])) throw Error(`missing ordering attribute for ${id}`);
    order.sort((a, b) => input.attributes![b]! - input.attributes![a]! || participants.indexOf(a) - participants.indexOf(b));
  } else if (input.policy === "rolled") {
    const scores = Object.fromEntries(participants.map(id => [id, rollDice("1d20", input.roller).total]));
    order.sort((a, b) => scores[b]! - scores[a]! || participants.indexOf(a) - participants.indexOf(b));
  }
  const encounter: Encounter = { id: input.id ?? randomUUID(), sessionId: input.sessionId, state: "live", participants, orderingPolicy: input.policy, order: input.policy === "none" ? [] : order, currentActorId: input.policy === "none" ? undefined : order[0], round: input.policy === "none" ? 0 : 1, turn: input.policy === "none" ? 0 : 1 };
  const events = [event("EncounterStarted", encounter, { participants, orderingPolicy: input.policy }), event("OrderEstablished", encounter, { order: encounter.order })];
  if (encounter.currentActorId) events.push(event("RoundStarted", encounter, { round: 1 }), event("TurnStarted", encounter, { actorId: encounter.currentActorId, round: 1, turn: 1 }));
  return { encounter, events };
}

function advanceEffects(encounter: Encounter, state: ActorRuntimeState, unit: "turns" | "rounds", definitions: Record<string, EffectDefinition>, events: EncounterEvent[]): ActorRuntimeState {
  const effects: ActiveEffect[] = [];
  for (const effect of state.effects) {
    const definition = definitions[effect.definitionId];
    if (definition?.duration?.type !== unit || effect.remaining === undefined) { effects.push(effect); continue; }
    const remaining = effect.remaining - 1;
    events.push(event("EffectTicked", encounter, { actorId: state.actorId, effectId: effect.id, definitionId: effect.definitionId, remaining, unit }));
    if (remaining <= 0) events.push(event("EffectExpired", encounter, { actorId: state.actorId, effectId: effect.id, definitionId: effect.definitionId }));
    else effects.push({ ...effect, remaining });
  }
  return { ...state, effects };
}

export function advanceEncounter(encounter: Encounter, actors: Record<string, ActorRuntimeState>, effects: Record<string, EffectDefinition>): { encounter: Encounter; states: ActorRuntimeState[]; events: EncounterEvent[] } {
  if (encounter.state !== "live" || !encounter.currentActorId) throw Error("encounter has no active turn");
  const next: Encounter = structuredClone(encounter), states = structuredClone(actors), events: EncounterEvent[] = [];
  const actorId = encounter.currentActorId;
  events.push(event("TurnEnded", encounter, { actorId, round: encounter.round, turn: encounter.turn }));
  if (states[actorId]) states[actorId] = advanceEffects(encounter, states[actorId], "turns", effects, events);
  const at = encounter.order.indexOf(actorId);
  if (at < 0) throw Error("current actor missing from order");
  if (at === encounter.order.length - 1) {
    events.push(event("RoundEnded", encounter, { round: encounter.round }));
    for (const id of encounter.participants) if (states[id]) states[id] = advanceEffects(encounter, states[id], "rounds", effects, events);
    next.round++; next.currentActorId = encounter.order[0];
    events.push(event("RoundStarted", next, { round: next.round }));
  } else next.currentActorId = encounter.order[at + 1];
  next.turn++;
  events.push(event("TurnStarted", next, { actorId: next.currentActorId, round: next.round, turn: next.turn }));
  return { encounter: next, states: Object.values(states).filter(state => JSON.stringify(state) !== JSON.stringify(actors[state.actorId])), events };
}

export function endEncounter(encounter: Encounter): { encounter: Encounter; events: EncounterEvent[] } {
  if (encounter.state !== "live") throw Error("encounter already ended");
  const next = { ...encounter, state: "ended" as const, currentActorId: undefined };
  return { encounter: next, events: [event("EncounterEnded", next)] };
}
