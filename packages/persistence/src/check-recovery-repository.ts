import { isDeepStrictEqual } from "node:util";
import postgres from "postgres";
import { replayChecks } from "@masterhost/game-runtime";
import type { ReplayEvent, ReplayedCheck } from "@masterhost/game-runtime";

interface Rows { events: ReplayEvent[]; checks: (ReplayedCheck & { id: string; sessionId: string; participantId: string; checkId: string; difficulty: number; visibility: string; status: string })[] }
const read = (tx: ReturnType<typeof postgres>, sessionId: string) => tx`
  select
    coalesce((select jsonb_agg(jsonb_build_object('sequence',sequence,'type',event_type,'payload',payload,'schemaVersion',schema_version) order by sequence) from game_events where session_id=${sessionId}), '[]'::jsonb) as events,
    coalesce((select jsonb_agg(jsonb_build_object('id',id,'sessionId',session_id,'participantId',participant_id,'checkId',check_id,'difficulty',difficulty,'visibility',visibility,'status',status,'request',request,'resolution',resolution) order by id) from pending_checks where session_id=${sessionId}), '[]'::jsonb) as checks
`;
function compare(rows: Rows, sessionId: string) {
  const replayed = replayChecks(rows.events, sessionId);
  const stored = new Map(rows.checks.map(check => [check.id, check]));
  const expected = new Map(replayed.checks.map(check => [check.request.id, check]));
  const checkIds = [...new Set([...stored.keys(), ...expected.keys()])].filter(id => {
    const actual = stored.get(id), check = expected.get(id);
    return !actual || !check || actual.sessionId !== sessionId || actual.participantId !== check.request.participantId || actual.checkId !== check.request.checkId || actual.difficulty !== check.request.difficulty || actual.visibility !== check.request.visibility || actual.status !== (check.resolution ? "resolved" : "pending") || !isDeepStrictEqual(actual.request, check.request) || !isDeepStrictEqual(actual.resolution, check.resolution);
  }).sort();
  return { report: { matching: !replayed.issues.length && !checkIds.length, eventCount: rows.events.length, checkIds, issues: replayed.issues }, expected: replayed.checks };
}

export class CheckRecoveryRepository {
  private sql;
  constructor(url: string) { this.sql = postgres(url); }
  async migrate() { await this.sql`create table if not exists check_repair_log(id uuid primary key default gen_random_uuid(),session_id uuid not null,event_count bigint not null,check_ids jsonb not null,created_at timestamptz not null default now())`; }
  async verify(sessionId: string) { return compare((await read(this.sql, sessionId))[0] as unknown as Rows, sessionId).report; }
  async repairFinishedSession(sessionId: string) {
    return this.sql.begin(async tx => {
      await tx`set local lock_timeout = '5s'`;
      await tx`lock table game_events, pending_checks in share row exclusive mode`;
      const session = (await tx`select state from sessions where id=${sessionId} for update`)[0];
      if (session?.state !== "finished") throw Object.assign(Error("repair requires a finished session"), { statusCode: 409 });
      const { report, expected } = compare((await read(tx as unknown as ReturnType<typeof postgres>, sessionId))[0] as unknown as Rows, sessionId);
      if (report.issues.length) throw Object.assign(Error("check events cannot be replayed"), { statusCode: 409, report });
      if (report.matching) return { repaired: false, ...report };
      for (const check of expected.filter(item => report.checkIds.includes(item.request.id))) {
        const request = check.request, resolution = check.resolution;
        await tx`insert into pending_checks(id,session_id,participant_id,check_id,difficulty,visibility,status,request,resolution,created_at,resolved_at)
          values(${request.id},${sessionId},${request.participantId},${request.checkId},${request.difficulty},${request.visibility},${resolution ? "resolved" : "pending"},${tx.json(request as unknown as Parameters<typeof tx.json>[0])},${resolution ? tx.json(resolution as unknown as Parameters<typeof tx.json>[0]) : null},${request.createdAt},${resolution?.resolvedAt ?? null})
          on conflict(id) do update set participant_id=excluded.participant_id,check_id=excluded.check_id,difficulty=excluded.difficulty,visibility=excluded.visibility,status=excluded.status,request=excluded.request,resolution=excluded.resolution,created_at=excluded.created_at,resolved_at=excluded.resolved_at
          where pending_checks.session_id=excluded.session_id`;
      }
      for (const id of report.checkIds.filter(id => !expected.some(check => check.request.id === id))) await tx`delete from pending_checks where session_id=${sessionId} and id=${id}`;
      const after = compare((await read(tx as unknown as ReturnType<typeof postgres>, sessionId))[0] as unknown as Rows, sessionId).report;
      if (!after.matching) throw Object.assign(Error("check repair did not converge"), { statusCode: 409, report: after });
      const audit = (await tx`insert into check_repair_log(session_id,event_count,check_ids) values(${sessionId},${report.eventCount},${tx.json(report.checkIds)}) returning id`)[0]!;
      return { repaired: true, auditId: audit.id, ...report };
    });
  }
  async close() { await this.sql.end(); }
}
