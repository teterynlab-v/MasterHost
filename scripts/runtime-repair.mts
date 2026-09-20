import { RuntimeReplayRepository } from "@masterhost/persistence";

const args = process.argv.slice(2);
const sessionId = args[args.indexOf("--session-id") + 1];
const apply = args.includes("--apply");
if (!sessionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
  throw Error("usage: tsx scripts/runtime-repair.mts --session-id <uuid> [--apply]");
}
const url = process.env.DATABASE_URL ?? "postgresql://masterhost:masterhost@localhost:5432/masterhost";
const repository = new RuntimeReplayRepository(url);
try {
  const before = await repository.verify(sessionId);
  if (!apply) {
    console.log(JSON.stringify({ mode: "preview", sessionId, ...before }));
  } else {
    const result = await repository.repairFinishedSession(sessionId);
    const after = await repository.verify(sessionId);
    if (!after.matching) throw Error("repair committed but verification still reports a mismatch");
    console.log(JSON.stringify({ mode: "apply", sessionId, result, after }));
  }
} finally {
  await repository.close();
}
