import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { newCheckRequest, resolveCheck } from "@masterhost/game-runtime";
import { CheckRecoveryRepository, GameRepository, RuntimeRepository } from "@masterhost/persistence";

const url = process.env.DATABASE_URL ?? "postgresql://masterhost:masterhost@localhost:5432/masterhost";
const sql = postgres(url), sessionId = randomUUID(), participantId = randomUUID();
const runtime = new RuntimeRepository(url), game = new GameRepository(url), recovery = new CheckRecoveryRepository(url);
try {
  await runtime.migrate(); await game.migrate(); await recovery.migrate();
  await sql`insert into sessions(id,realm_id,campaign_id,state) values(${sessionId},${randomUUID()},${randomUUID()},'finished')`;
  const pending = newCheckRequest({ sessionId, participantId, checkId: "perception", difficulty: 6, visibility: "full" });
  const resolved = newCheckRequest({ sessionId, participantId, checkId: "perception", difficulty: 6, visibility: "full" });
  await game.createCheck(pending); await game.createCheck(resolved);
  await game.resolveCheck(resolved.id, resolveCheck(resolved, { id: "perception", label: "Perception", dice: "1d6", modifierField: "perception" }, { perception: 2 }, () => 4));
  assert.equal((await recovery.verify(sessionId)).matching, true);
  await sql`update pending_checks set status='resolved',request=jsonb_set(request,'{checkId}','"wrong"'::jsonb) where id=${pending.id}`;
  await sql`delete from pending_checks where id=${resolved.id}`;
  const extra = newCheckRequest({ sessionId, participantId, checkId: "extra", difficulty: 1, visibility: "full" });
  await sql`insert into pending_checks(id,session_id,participant_id,check_id,difficulty,visibility,status,request) values(${extra.id},${sessionId},${participantId},${extra.checkId},${extra.difficulty},${extra.visibility},'pending',${sql.json({ ...extra })})`;
  assert.deepEqual((await recovery.verify(sessionId)).checkIds, [pending.id, resolved.id, extra.id].sort());
  const result = await recovery.repairFinishedSession(sessionId);
  assert.equal(result.repaired, true);
  assert.equal((await recovery.verify(sessionId)).matching, true);
  assert.deepEqual(await game.check(pending.id), { request: pending, resolution: null });
  assert.ok((await game.check(resolved.id))?.resolution);
  assert.equal(await game.check(extra.id), null);
  assert.equal((await recovery.repairFinishedSession(sessionId)).repaired, false);
  assert.equal((await sql`select count(*)::int as count from check_repair_log where session_id=${sessionId}`)[0]?.count, 1);
  await sql`update sessions set state='live' where id=${sessionId}`;
  await assert.rejects(recovery.repairFinishedSession(sessionId), /finished session/);
  await sql`update sessions set state='finished' where id=${sessionId}`;
  await game.event(sessionId, "DiceRolled", { requestId: pending.id, roll: { total: 1 } });
  await assert.rejects(recovery.repairFinishedSession(sessionId), /cannot be replayed/);
  assert.equal((await recovery.verify(sessionId)).matching, false);
  console.log("Check recovery smoke passed: pending/resolved replay, corruption detection, finished-session repair, audit, no-op and unsafe/live rejection.");
} finally {
  await sql`delete from check_repair_log where session_id=${sessionId}`;
  await sql`delete from runtime_command_receipts where session_id=${sessionId}`;
  await sql`delete from game_events where session_id=${sessionId}`;
  await sql`delete from pending_checks where session_id=${sessionId}`;
  await sql`delete from sessions where id=${sessionId}`;
  await Promise.all([sql.end(), runtime.close(), game.close(), recovery.close()]);
}
