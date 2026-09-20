import { describe, expect, it } from "vitest";
import { replayRuntimeEvents } from "@masterhost/game-runtime";
import type { ReplayEvent } from "@masterhost/game-runtime";

const events = (items: { type: string; payload: Record<string, unknown> }[]): ReplayEvent[] => items.map((item, index) => ({ ...item, sequence: index + 1, schemaVersion: "1" }));

describe("runtime event replay", () => {
  it("rebuilds actor resources, effects and ended encounter state", () => {
    const replayed = replayRuntimeEvents(events([
      { type: "ActorInitialized", payload: { actorId: "actor", resources: { health: 20 }, effects: [] } },
      { type: "ResourceChanged", payload: { actorId: "actor", resource: "health", before: 20, after: 15 } },
      { type: "EffectApplied", payload: { actorId: "actor", effect: { id: "effect", definitionId: "poison", remaining: 1, appliedAt: "now" } } },
      { type: "EncounterStarted", payload: { sessionId: "session", encounterId: "encounter", participants: ["actor"], orderingPolicy: "fixed" } },
      { type: "OrderEstablished", payload: { encounterId: "encounter", order: ["actor"] } },
      { type: "RoundStarted", payload: { encounterId: "encounter", round: 1 } },
      { type: "TurnStarted", payload: { encounterId: "encounter", actorId: "actor", turn: 1 } },
      { type: "EffectTicked", payload: { actorId: "actor", effectId: "effect", remaining: 0 } },
      { type: "EffectExpired", payload: { actorId: "actor", effectId: "effect" } },
      { type: "EncounterEnded", payload: { encounterId: "encounter" } },
    ]));
    expect(replayed.issues).toEqual([]);
    expect(replayed.actors).toEqual([{ actorId: "actor", resources: { health: 15 }, effects: [] }]);
    expect(replayed.encounters).toEqual([{ id: "encounter", sessionId: "session", state: "ended", participants: ["actor"], orderingPolicy: "fixed", order: ["actor"], currentActorId: undefined, round: 1, turn: 1 }]);
  });

  it("reports unsupported or malformed events instead of claiming recovery", () => {
    const replayed = replayRuntimeEvents([
      { sequence: 2, schemaVersion: "1", type: "EffectExpired", payload: { actorId: "missing", effectId: "missing" } },
      { sequence: 1, schemaVersion: "1", type: "ActionResolved", payload: {} },
      { sequence: 3, schemaVersion: "2", type: "ActionResolved", payload: {} },
      { sequence: 4, schemaVersion: "1", type: "FutureMutation", payload: {} },
    ]);
    expect(replayed.issues).toHaveLength(4);
  });
});
