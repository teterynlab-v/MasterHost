import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { executeAction, initializeResources, resolveCheck, startEncounter } from "@masterhost/game-runtime";
import type { ActorRuntimeState, CheckRequest, ResourceDefinition } from "@masterhost/game-runtime";
import { loadWorldPack, validateCharacterValues } from "@masterhost/worldpack-sdk";

describe.each([
  { path: "classic-fantasy-test", actionId: "sword-strike", checkId: "athletics", resourceId: "health", modifierField: "athletics", roleField: "archetype", role: "warrior", ordering: "fixed" },
  { path: "cyberpunk-test", actionId: "neural-overload", checkId: "intrusion", resourceId: "humanity", modifierField: "interface", roleField: "role", role: "netrunner", ordering: "none" },
])("$path runtime conformance", setting => {
  it("uses Pack-defined character modifiers and composed action steps", async () => {
    const pack = await loadWorldPack(resolve("worldpacks", setting.path));
    const values = validateCharacterValues(pack.content.characterCreation!, { name: "Tester", [setting.roleField]: setting.role, [setting.modifierField]: 2 });
    const check = { id: "check", sessionId: "s", participantId: "a", checkId: setting.checkId, difficulty: 5, visibility: "full", status: "pending", createdAt: "now" } as CheckRequest;
    const result = resolveCheck(check, { id: setting.checkId, ...pack.content.checks![setting.checkId]! }, values, () => 3);
    expect(result.modifier).toBe(2);
    expect(result.outcome).toBe("success");
    const resources = Object.fromEntries(Object.entries(pack.content.resources ?? {}).map(([id, definition]) => [id, { id, ...definition }])) as Record<string, ResourceDefinition>;
    const actor = (id: string): ActorRuntimeState => ({ actorId: id, resources: initializeResources(resources), effects: [] });
    const target = actor("target");
    const actionResult = executeAction({
      action: { id: setting.actionId, ...pack.content.actions![setting.actionId]! },
      request: { sessionId: "s", actionId: setting.actionId, actorId: "actor", targetActorIds: ["target"], inputs: { difficulty: 5 } },
      actors: { actor: actor("actor"), target },
      checks: Object.fromEntries(Object.entries(pack.content.checks ?? {}).map(([id, definition]) => [id, { id, ...definition }])),
      resources,
      effects: {},
      characterValues: { actor: values },
      roller: () => 3,
    });
    expect(actionResult.states[0]?.resources[setting.resourceId]).toBe(target.resources[setting.resourceId]! - 3);
    expect(actionResult.events.map(event => event.type)).toEqual(["ActionRequested", "DiceRolled", "CheckResolved", "DiceRolled", "ResourceChanged", "ActionResolved"]);
    const encounter = startEncounter({ sessionId: "s", participantIds: ["actor", "target"], policy: pack.content.encounter!.orderingPolicy });
    expect(encounter.encounter.orderingPolicy).toBe(setting.ordering);
  });
});
