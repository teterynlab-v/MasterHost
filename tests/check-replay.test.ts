import { describe, expect, it } from "vitest";
import { replayChecks } from "@masterhost/game-runtime";
import type { ReplayEvent } from "@masterhost/game-runtime";

const request = { id: "c", sessionId: "s", participantId: "p", checkId: "perception", difficulty: 6, visibility: "full" as const, status: "pending" as const, createdAt: "2026-09-21T00:00:00.000Z" };
const roll = { expression: "1d6", terms: [{ sides: 6, rolls: [4], subtotal: 4, sign: 1 }], modifier: 0, total: 4 };
const resolution = { requestId: "c", roll, modifier: 2, total: 6, difficulty: 6, outcome: "success", resolvedAt: "2026-09-21T00:00:01.000Z" };
const event = (sequence: number, type: string, payload: Record<string, unknown>): ReplayEvent => ({ sequence, type, payload, schemaVersion: "1" });

describe("standalone Check replay", () => {
  it("reconstructs pending and resolved Checks while ignoring composed Action rolls", () => {
    const events = [event(1, "CheckRequested", request), event(2, "DiceRolled", { actionId: "strike", roll }), event(3, "DiceRolled", { requestId: "c", roll }), event(4, "CheckResolved", resolution), event(5, "CheckRequested", { ...request, id: "pending" })];
    expect(replayChecks(events, "s")).toEqual({ checks: [{ request, resolution }, { request: { ...request, id: "pending" }, resolution: null }], issues: [] });
  });
  it("rejects incomplete or contradictory Check event streams", () => {
    expect(replayChecks([event(1, "CheckRequested", request), event(2, "DiceRolled", { requestId: "c", roll })], "s").issues).toContain("standalone check c has a roll without a resolution");
    expect(replayChecks([event(1, "CheckRequested", request), event(2, "DiceRolled", { requestId: "c", roll }), event(3, "CheckResolved", { ...resolution, total: 7 })], "s").issues).toContain("event 3: invalid CheckResolved for c");
    expect(replayChecks([event(1, "CheckRequested", request), event(2, "CheckRequested", request)], "s").issues).toContain("event 2: invalid or duplicate CheckRequested");
  });
});
