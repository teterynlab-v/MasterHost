import { randomUUID } from "node:crypto";
import { applyEffect, applyResource, effectiveModifier, rollDice } from "./index.js";
import type { ActionDefinition, ActorRuntimeState, CheckDefinition, EffectDefinition, ResourceDefinition } from "./index.js";

export type ActionStep =
  | { check: { id: string; against?: number | string }; when?: { previousOutcome: "success" | "failure" } }
  | { roll: { id: string; dice: string }; when?: { previousOutcome: "success" | "failure" } }
  | { resource: { target: "actor" | "target"; resource: string; operation: "add" | "subtract" | "set"; value: number | string }; when?: { previousOutcome: "success" | "failure" } }
  | { effect: { target: "actor" | "target"; id: string }; when?: { previousOutcome: "success" | "failure" } };

export interface ActionRequest { sessionId: string; actionId: string; actorId: string; targetActorIds?: string[]; inputs?: Record<string, number> }
export interface ActionEvent { type: "ActionRequested" | "DiceRolled" | "CheckResolved" | "ResourceChanged" | "EffectApplied" | "ActionResolved"; payload: Record<string, unknown> }
export interface ActionContext {
  action: ActionDefinition;
  request: ActionRequest;
  actors: Record<string, ActorRuntimeState>;
  checks: Record<string, CheckDefinition>;
  resources: Record<string, ResourceDefinition>;
  effects: Record<string, EffectDefinition>;
  characterValues?: Record<string, Record<string, unknown>>;
  roller?: (sides: number) => number;
}

function stepsFor(action: ActionDefinition): ActionStep[] {
  if (action.steps) return action.steps;
  if (action.kind === "resource" && action.resource && action.operation && action.amount !== undefined)
    return [{ resource: { target: action.target === "self" ? "actor" : "target", resource: action.resource, operation: action.operation, value: action.amount } }];
  if (action.kind === "effect" && action.effectId)
    return [{ effect: { target: action.target === "self" ? "actor" : "target", id: action.effectId } }];
  if (action.kind === "check" && action.checkId) return [{ check: { id: action.checkId } }];
  throw Error(`action ${action.id} has no executable steps`);
}

function targets(request: ActionRequest, action: ActionDefinition, actors: Record<string, ActorRuntimeState>): string[] {
  if (!actors[request.actorId]) throw Error("actor is not in the session");
  const ids = request.targetActorIds ?? [];
  if (new Set(ids).size !== ids.length) throw Error("duplicate action target");
  const policy = action.target === "actor" ? "single-actor" : action.target;
  if (policy === "none" && ids.length) throw Error("action does not accept targets");
  if (policy === "self" && ids.length && (ids.length !== 1 || ids[0] !== request.actorId)) throw Error("self action cannot target another actor");
  if (policy === "single-actor" && ids.length !== 1) throw Error("action requires one target");
  if (policy === "multiple-actors" && (ids.length < 1 || ids.length > 20)) throw Error("action requires 1 to 20 targets");
  for (const id of ids) if (!actors[id]) throw Error(`target actor ${id} is not in the session`);
  return policy === "self" ? [request.actorId] : policy === "none" ? [] : ids;
}

function numeric(value: number | string, input: Record<string, number>, totals: Record<string, number>, target: ActorRuntimeState | undefined): number {
  const n = typeof value === "number" ? value : value.startsWith("input.") ? input[value.slice(6)] : value.startsWith("target.") ? target?.resources[value.slice(7)] : value.endsWith(".total") ? totals[value.slice(0, -6)] : undefined;
  if (typeof n !== "number" || !Number.isFinite(n)) throw Error(`invalid numeric action value ${value}`);
  return n;
}

export function executeAction(context: ActionContext): { states: ActorRuntimeState[]; events: ActionEvent[] } {
  const { request, action } = context;
  if (action.id !== request.actionId) throw Error("action ID mismatch");
  const blocking=context.actors[request.actorId]?.effects.find(effect=>context.effects[effect.definitionId]?.blockedActions?.includes(action.id));if(blocking)throw Error(`action ${action.id} blocked by effect ${blocking.definitionId}`);
  const ids = targets(request, action, context.actors);
  const states = structuredClone(context.actors);
  const events: ActionEvent[] = [{ type: "ActionRequested", payload: { sessionId: request.sessionId, actionId: action.id, actorId: request.actorId, targetActorIds: ids } }];
  const steps = stepsFor(action), touched = new Set<string>();
  for (const targetId of ids.length ? ids : [undefined]) {
    let previousOutcome: "success" | "failure" | undefined;
    const totals: Record<string, number> = {};
    for (const step of steps) {
      if (step.when && step.when.previousOutcome !== previousOutcome) continue;
      if ("check" in step) {
        const def = context.checks[step.check.id]; if (!def) throw Error(`unknown check ${step.check.id}`);
        const roll = rollDice(def.dice, context.roller), base = Number(context.characterValues?.[request.actorId]?.[def.modifierField ?? ""] ?? 0);
        if (!Number.isFinite(base)) throw Error("invalid check modifier");
        const modifier = def.modifierField ? effectiveModifier(base, def.modifierField, states[request.actorId]!.effects, context.effects) : 0;
        const difficulty = numeric(step.check.against ?? "input.difficulty", request.inputs ?? {}, totals, targetId ? states[targetId] : undefined);
        const total = roll.total + modifier,outcome=def.criticalSuccess&&roll.total>=def.criticalSuccess.rollTotalAtLeast?"critical-success":def.criticalFailure&&roll.total<=def.criticalFailure.rollTotalAtMost?"critical-failure":total>=difficulty?"success":"failure";previousOutcome=outcome.endsWith("success")?"success":"failure"; totals[step.check.id] = total;
        events.push({ type: "DiceRolled", payload: { sessionId: request.sessionId, actionId: action.id, actorId: request.actorId, targetActorId: targetId, roll } });
        events.push({ type: "CheckResolved", payload: { sessionId: request.sessionId, actionId: action.id, actorId: request.actorId, targetActorId: targetId, checkId: step.check.id, total, difficulty, outcome } });
      } else if ("roll" in step) {
        const roll = rollDice(step.roll.dice, context.roller); totals[step.roll.id] = roll.total;
        events.push({ type: "DiceRolled", payload: { sessionId: request.sessionId, actionId: action.id, actorId: request.actorId, targetActorId: targetId, rollId: step.roll.id, roll } });
      } else if ("resource" in step) {
        const ownerId = step.resource.target === "actor" ? request.actorId : targetId;
        if (!ownerId || !states[ownerId]) throw Error("resource step has no target");
        const def = context.resources[step.resource.resource]; if (!def) throw Error(`unknown resource ${step.resource.resource}`);
        const amount = numeric(step.resource.value, request.inputs ?? {}, totals, targetId ? states[targetId] : undefined);
        const before = states[ownerId]!.resources[def.id] ?? def.default, after = applyResource(def, before, step.resource.operation, amount);
        states[ownerId]!.resources[def.id] = after; touched.add(ownerId);
        events.push({ type: "ResourceChanged", payload: { sessionId: request.sessionId, actionId: action.id, actorId: ownerId, sourceActorId: request.actorId, resource: def.id, before, after, amount } });
      } else {
        const ownerId = step.effect.target === "actor" ? request.actorId : targetId;
        if (!ownerId || !states[ownerId]) throw Error("effect step has no target");
        const def = context.effects[step.effect.id]; if (!def) throw Error(`unknown effect ${step.effect.id}`);
        const effect = applyEffect(def, request.actorId); states[ownerId]!.effects.push(effect); touched.add(ownerId);
        events.push({ type: "EffectApplied", payload: { sessionId: request.sessionId, actionId: action.id, actorId: ownerId, sourceActorId: request.actorId, effect } });
      }
    }
  }
  events.push({ type: "ActionResolved", payload: { sessionId: request.sessionId, actionId: action.id, actorId: request.actorId, targetActorIds: ids } });
  return { states: [...touched].map(id => states[id]!), events };
}
