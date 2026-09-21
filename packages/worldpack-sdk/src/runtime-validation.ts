import { parseDice } from "@masterhost/game-runtime";
import type { LoadedWorldPack } from "./index.js";

type Content = LoadedWorldPack["content"];
type Condition = "success" | "failure" | undefined;
const id = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

function numericReference(value: number | string, actionId: string, step: number, target: string, resources: Set<string>, outputs: Map<string, { condition: Condition; epoch: number }>, condition: Condition, epoch: number) {
  if (typeof value === "number") return;
  const [head, tail, extra] = value.split(".");
  if (extra !== undefined || !head || !tail) throw Error(`Action ${actionId} step ${step}: invalid numeric reference ${value}`);
  if (head === "input" && id.test(tail)) return;
  if (head === "target" && target !== "none" && resources.has(tail)) return;
  const source = outputs.get(head);
  if (tail !== "total" || !source || source.condition && (condition !== source.condition || epoch !== source.epoch)) throw Error(`Action ${actionId} step ${step}: unavailable numeric reference ${value}`);
}

export function validateRuntimePack(content: Content): void {
  const resources = new Set(Object.keys(content.resources ?? {}));
  const numericCharacterFields = new Set<string>();
  const numericActorFields = new Set<string>();
  const fields = new Set<string>(), steps = new Set<string>();
  for (const step of content.characterCreation?.steps ?? []) {
    if (steps.has(step.id)) throw Error(`Character: duplicate step ${step.id}`);
    steps.add(step.id);
    for (const field of step.fields) {
      if (fields.has(field.id)) throw Error(`Character: duplicate field ${field.id}`);
      fields.add(field.id);
      if (field.type === "choice" && (!field.options?.length || new Set(field.options.map(option => option.value)).size !== field.options.length)) throw Error(`Character field ${field.id}: invalid choice options`);
      if (field.type === "number") {
        if (field.min !== undefined && field.max !== undefined && field.min > field.max) throw Error(`Character field ${field.id}: min exceeds max`);
        if (field.default !== undefined && (typeof field.default !== "number" || !Number.isFinite(field.default) || field.min !== undefined && field.default < field.min || field.max !== undefined && field.default > field.max)) throw Error(`Character field ${field.id}: invalid default`);
        numericCharacterFields.add(field.id);
      }
    }
  }

  for (const [name, resource] of Object.entries(content.resources ?? {})) {
    if (resource.min !== undefined && resource.default < resource.min || resource.max !== undefined && resource.default > resource.max) throw Error(`Resource ${name}: default outside bounds`);
  }
  for (const [name, effect] of Object.entries(content.effects ?? {})) {
    if (effect.duration && ["turns", "rounds"].includes(effect.duration.type) && effect.duration.value === undefined) throw Error(`Effect ${name}: timed duration requires value`);
    if (effect.duration && ["session", "permanent"].includes(effect.duration.type) && effect.duration.value !== undefined) throw Error(`Effect ${name}: duration value is not used`);
  }
  for (const template of Object.values(content.actorTemplates ?? {})) for (const field of Object.keys(template.attributes ?? {})) numericActorFields.add(field);
  for (const [name, effect] of Object.entries(content.effects ?? {})) for (const field of Object.keys(effect.modifiers ?? {})) {
    if (!numericCharacterFields.has(field) && !numericActorFields.has(field)) throw Error(`Effect ${name}: modifier ${field} has no numeric Character or Actor field`);
  }
  for (const [name, check] of Object.entries(content.checks ?? {})) {
    let parsed;try { parsed=parseDice(check.dice); } catch (error) { throw Error(`Check ${name}: ${error instanceof Error ? error.message : String(error)}`); }
    const minimum=parsed.modifier+parsed.terms.reduce((sum,term)=>sum+(term.sign===1?term.count:-term.count*term.sides),0),maximum=parsed.modifier+parsed.terms.reduce((sum,term)=>sum+(term.sign===1?term.count*term.sides:-term.count),0),success=check.criticalSuccess?.rollTotalAtLeast,failure=check.criticalFailure?.rollTotalAtMost;
    if(success!==undefined&&(success<minimum||success>maximum)||failure!==undefined&&(failure<minimum||failure>maximum)||success!==undefined&&failure!==undefined&&failure>=success)throw Error(`Check ${name}: invalid critical thresholds`);
    if (check.modifierField && !numericCharacterFields.has(check.modifierField)) throw Error(`Check ${name}: modifier field ${check.modifierField} must be a numeric Character field`);
  }
  if (content.encounter?.orderingPolicy === "attribute" && (!content.encounter.attributeField || !numericCharacterFields.has(content.encounter.attributeField))) throw Error("Encounter: attribute ordering requires a numeric Character field");

  for (const [name, action] of Object.entries(content.actions ?? {})) {
    if (!("steps" in action)) {
      const valid = action.kind === "check" && action.checkId && !action.resource && !action.effectId && action.operation === undefined && action.amount === undefined
        || action.kind === "resource" && action.resource && action.operation && action.amount !== undefined && !action.checkId && !action.effectId && action.target !== "none"
        || action.kind === "effect" && action.effectId && !action.checkId && !action.resource && action.operation === undefined && action.amount === undefined && action.target !== "none";
      if (!valid) throw Error(`Action ${name}: legacy kind has no valid executable definition`);
      continue;
    }
    let seenCheck = false, epoch = 0;
    const outputs = new Map<string, { condition: Condition; epoch: number }>();
    action.steps.forEach((step, index) => {
      const at = index + 1, condition = step.when?.previousOutcome;
      if (condition && !seenCheck) throw Error(`Action ${name} step ${at}: conditional step requires a preceding Check`);
      if ("check" in step) {
        if (step.check.against !== undefined) numericReference(step.check.against, name, at, action.target, resources, outputs, condition, epoch);
        if (outputs.has(step.check.id)) throw Error(`Action ${name} step ${at}: duplicate result ID ${step.check.id}`);
        seenCheck = true; epoch++;
        outputs.set(step.check.id, { condition, epoch });
      } else if ("roll" in step) {
        try { parseDice(step.roll.dice); } catch (error) { throw Error(`Action ${name} step ${at}: ${error instanceof Error ? error.message : String(error)}`); }
        if (outputs.has(step.roll.id)) throw Error(`Action ${name} step ${at}: duplicate result ID ${step.roll.id}`);
        outputs.set(step.roll.id, { condition, epoch });
      } else if ("resource" in step) {
        if (step.resource.target === "target" && action.target === "none") throw Error(`Action ${name} step ${at}: target actor is unavailable`);
        numericReference(step.resource.value, name, at, action.target, resources, outputs, condition, epoch);
      } else if (step.effect.target === "target" && action.target === "none") throw Error(`Action ${name} step ${at}: target actor is unavailable`);
    });
  }
}
