import { describe, expect, it } from "vitest";
import { advanceEncounter, endEncounter, startEncounter } from "@masterhost/game-runtime";

describe("encounter lifecycle", () => {
  it("orders by pack-selected attribute and emits turn, round and effect events", () => {
    const started = startEncounter({ sessionId: "s", participantIds: ["a", "b"], policy: "attribute", attributes: { a: 2, b: 5 }, id: "e" });
    expect(started.encounter.order).toEqual(["b", "a"]);
    expect(started.events.map(e => e.type)).toEqual(["EncounterStarted", "OrderEstablished", "RoundStarted", "TurnStarted"]);
    const actors = {
      a: { actorId: "a", resources: {}, effects: [{ id: "poison", definitionId: "poison", remaining: 1, appliedAt: "now" }] },
      b: { actorId: "b", resources: {}, effects: [] }
    };
    const first = advanceEncounter(started.encounter, actors, { poison: { id: "poison", label: "Poison", duration: { type: "turns", value: 1 } } });
    expect(first.encounter.currentActorId).toBe("a");
    const second = advanceEncounter(first.encounter, actors, { poison: { id: "poison", label: "Poison", duration: { type: "turns", value: 1 } } });
    expect(second.events.map(e => e.type)).toEqual(["TurnEnded", "EffectTicked", "EffectExpired", "RoundEnded", "RoundStarted", "TurnStarted"]);
    expect(second.states[0]?.effects).toEqual([]);
    expect(second.encounter.round).toBe(2);
    expect(endEncounter(second.encounter).events[0]?.type).toBe("EncounterEnded");
  });
  it("allows an encounter without initiative and rejects malformed custom order", () => {
    const started = startEncounter({ sessionId: "s", participantIds: ["a", "b"], policy: "none" });
    expect(started.encounter.currentActorId).toBeUndefined();
    expect(started.events.map(e => e.type)).toEqual(["EncounterStarted", "OrderEstablished"]);
    expect(() => startEncounter({ sessionId: "s", participantIds: ["a", "b"], policy: "custom", customOrder: ["a", "a"] })).toThrow(/exactly once/);
  });
});
