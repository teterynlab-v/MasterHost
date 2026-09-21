import type { CheckRequest, CheckResolution } from "./index.js";
import type { ReplayEvent } from "./replay.js";

export interface ReplayedCheck { request: CheckRequest; resolution: CheckResolution | null }
export function replayChecks(events: ReplayEvent[], sessionId: string): { checks: ReplayedCheck[]; issues: string[] } {
  const checks = new Map<string, ReplayedCheck>();
  const rolls = new Map<string, unknown>();
  const issues: string[] = [];
  let previous = 0;
  for (const event of events) {
    if (!Number.isSafeInteger(event.sequence) || event.sequence <= previous) { issues.push(`event sequence ${event.sequence} is out of order`); continue; }
    previous = event.sequence;
    if (event.schemaVersion !== "1") { issues.push(`event ${event.sequence} has unsupported schema ${event.schemaVersion}`); continue; }
    if (!["CheckRequested", "DiceRolled", "CheckResolved"].includes(event.type)) continue;
    try {
      const payload = event.payload;
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw Error("invalid check payload");
      if (event.type === "CheckRequested") {
        const request = payload as unknown as CheckRequest;
        if (typeof request.id !== "string" || !request.id || request.sessionId !== sessionId || typeof request.participantId !== "string" || !request.participantId || typeof request.checkId !== "string" || !request.checkId || !Number.isInteger(request.difficulty) || !["full", "result-only", "roll-only", "hidden"].includes(request.visibility) || request.status !== "pending" || typeof request.createdAt !== "string" || !Number.isFinite(Date.parse(request.createdAt)) || checks.has(request.id)) throw Error("invalid or duplicate CheckRequested");
        checks.set(request.id, { request, resolution: null });
      } else if (typeof payload.requestId === "string") {
        const id = payload.requestId, check = checks.get(id);
        if (!check) throw Error(`unknown standalone check ${id}`);
        if (event.type === "DiceRolled") {
          if (rolls.has(id) || check.resolution || !payload.roll || typeof payload.roll !== "object" || !Number.isFinite((payload.roll as { total?: number }).total)) throw Error(`invalid or duplicate DiceRolled for ${id}`);
          rolls.set(id, payload.roll);
        } else {
          const resolution = payload as unknown as CheckResolution;
          const ordinary=resolution.total>=resolution.difficulty?"success":"failure";if (!rolls.has(id) || check.resolution || resolution.difficulty !== check.request.difficulty || resolution.requestId !== id || !resolution.roll || JSON.stringify(resolution.roll) !== JSON.stringify(rolls.get(id)) || !Number.isFinite(resolution.roll.total) || !Number.isFinite(resolution.modifier) || resolution.total !== resolution.roll.total + resolution.modifier || ![ordinary,"critical-success","critical-failure"].includes(resolution.outcome) || typeof resolution.resolvedAt !== "string" || !Number.isFinite(Date.parse(resolution.resolvedAt))) throw Error(`invalid CheckResolved for ${id}`);
          check.resolution = resolution;
        }
      } else if (payload.actionId === undefined) throw Error("check event has no request or action ID");
    } catch (error) { issues.push(`event ${event.sequence}: ${error instanceof Error ? error.message : String(error)}`); }
  }
  for (const id of rolls.keys()) if (!checks.get(id)?.resolution) issues.push(`standalone check ${id} has a roll without a resolution`);
  return { checks: [...checks.values()], issues };
}
