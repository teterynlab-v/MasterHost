import { describe, expect, it } from "vitest";
import { executeAction } from "@masterhost/game-runtime";
import type { ActionDefinition, ActorRuntimeState } from "@masterhost/game-runtime";

const action: ActionDefinition = { id: "strike", label: "Strike", target: "single-actor", steps: [
  { check: { id: "precision", against: "target.defense" } },
  { when: { previousOutcome: "success" }, roll: { id: "impact", dice: "1d8" } },
  { when: { previousOutcome: "success" }, resource: { target: "target", resource: "vitality", operation: "subtract", value: "impact.total" } }
] };
const actors = (): Record<string, ActorRuntimeState> => ({
  a: { actorId: "a", resources: { vitality: 10 }, effects: [] },
  b: { actorId: "b", resources: { vitality: 10, defense: 5 }, effects: [] }
});
const context = (roll: number) => ({ action, request: { sessionId: "s", actionId: "strike", actorId: "a", targetActorIds: ["b"] }, actors: actors(),
  checks: { precision: { id: "precision", label: "Precision", dice: "1d20" } },
  resources: { vitality: { id: "vitality", label: "Vitality", min: 0, max: 10, default: 10 } }, effects: {}, roller: () => roll });

describe("generic action pipeline", () => {
  it("executes conditional check, roll and resource steps with audit events", () => {
    const result = executeAction(context(8));
    expect(result.states).toEqual([{ actorId: "b", resources: { vitality: 2, defense: 5 }, effects: [] }]);
    expect(result.events.map(e => e.type)).toEqual(["ActionRequested", "DiceRolled", "CheckResolved", "DiceRolled", "ResourceChanged", "ActionResolved"]);
    expect(context(8).actors.b.resources.vitality).toBe(10);
  });
  it("skips dependent steps on failure", () => {
    const result = executeAction(context(1));
    expect(result.states).toEqual([]);
    expect(result.events.map(e => e.type)).toEqual(["ActionRequested", "DiceRolled", "CheckResolved", "ActionResolved"]);
  });
  it("rejects an invalid target before producing mutations", () => {
    expect(() => executeAction({ ...context(8), request: { sessionId: "s", actionId: "strike", actorId: "a", targetActorIds: ["foreign"] } })).toThrow(/not in the session/);
  });
});
