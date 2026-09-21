import assert from "node:assert/strict";
import { WorldRepository } from "@masterhost/persistence";

const url = process.env.DATABASE_URL ?? "postgresql://masterhost:masterhost@localhost:5432/masterhost";
const api = process.env.MASTERHOST_API_URL ?? "http://localhost:8080/api";
const repo = new WorldRepository(url);
try {
  const response = await fetch(`${api}/worlds`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ seed: "asset-cas-smoke", choices: {} }) });
  assert.equal(response.status, 200);
  const world = await response.json() as { id: string };
  const stale = (await repo.get(world.id))!;
  const image = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==", "base64");
  const uploaded = await fetch(`${api}/worlds/${world.id}/assets?name=portrait.png`, { method: "POST", headers: { "content-type": "application/octet-stream", "x-asset-media-type": "image/png" }, body: image });
  assert.equal(uploaded.status, 200);
  stale.revision++;
  await assert.rejects(repo.save(stale, "stale-authoring"), error => error instanceof Error && "statusCode" in error && error.statusCode === 409);
  const current = (await repo.get(world.id))!;
  assert.ok(current.assets?.["portrait.png"]);
  assert.equal(current.revision, stale.revision);
  console.log("World asset concurrency smoke passed: stale authoring cannot erase a committed image revision.");
} finally { await repo.close(); }
