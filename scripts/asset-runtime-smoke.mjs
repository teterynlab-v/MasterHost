import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const api = process.env.MASTERHOST_API_URL ?? "http://localhost:8080/api";
const image = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==", "base64");
const hash = createHash("sha256").update(image).digest("hex");
async function json(path, body, method="POST") { const response = await fetch(`${api}${path}`, { method, headers: body===undefined?{}:{"content-type":"application/json"}, body:body===undefined?undefined:JSON.stringify(body) }); const value = await response.json(); assert.ok(response.ok, `${path}: ${response.status} ${JSON.stringify(value)}`); return value; }
async function upload(id, name, data=image, mediaType="image/png") { return fetch(`${api}/worlds/${id}/assets?name=${encodeURIComponent(name)}`, { method:"POST",headers:{"content-type":"application/octet-stream","x-asset-media-type":mediaType},body:data }); }
const pack = await json("/pack", undefined, "GET");
const world = await json("/worlds", { seed:"asset-smoke", choices:{} });
assert.equal((await upload(world.id,"evil.html",image,"text/html")).status, 400);
assert.equal((await upload(world.id,"bad.png",Buffer.from("not an image"))).status, 400);
assert.equal((await upload(world.id,"../bad.png")).status, 400);
const first = await upload(world.id,"portrait.png"); assert.equal(first.status,200);
const withAsset = await first.json(); assert.equal(withAsset.assets["portrait.png"].checksum,hash);
assert.equal(withAsset.revision,world.revision+1);
const originalDownload = await fetch(`${api}/worlds/${world.id}/assets/portrait.png`);assert.equal(originalDownload.status,200);assert.deepEqual(Buffer.from(await originalDownload.arrayBuffer()),image);
const snapshot = await json(`/worlds/${world.id}/snapshots`,{name:"Image checkpoint"});
assert.equal((await upload(world.id,"map.png")).status,200);
const restored = await json(`/snapshots/${snapshot.id}/restore`);assert.equal(restored.assets["portrait.png"].checksum,hash);assert.equal(restored.assets["map.png"],undefined);
const regenerated = await json(`/worlds/${world.id}/regenerate`,{snapshotName:"Before image regeneration"});assert.equal(regenerated.assets["portrait.png"].checksum,hash);
const fork = await json(`/worlds/${world.id}/fork`,{name:"Asset fork"});assert.notEqual(fork.id,world.id);assert.equal(fork.assets["portrait.png"].checksum,hash);
assert.deepEqual(Buffer.from(await (await fetch(`${api}/worlds/${fork.id}/assets/portrait.png`)).arrayBuffer()),image);
const exported = await fetch(`${api}/worlds/${fork.id}/export`);assert.equal(exported.status,200);
const importedResponse = await fetch(`${api}/worlds/import`,{method:"POST",headers:{"content-type":"application/vnd.masterhost.world+zip"},body:await exported.arrayBuffer()});assert.equal(importedResponse.status,200);
const imported=await importedResponse.json();assert.notEqual(imported.id,fork.id);assert.equal(imported.assets["portrait.png"].checksum,hash);
assert.deepEqual(Buffer.from(await (await fetch(`${api}/worlds/${imported.id}/assets/portrait.png`)).arrayBuffer()),image);
console.log(`Asset runtime smoke passed for ${pack.manifest.id}: upload validation, snapshot/restore, regeneration, fork, ZIP import and byte readback.`);
