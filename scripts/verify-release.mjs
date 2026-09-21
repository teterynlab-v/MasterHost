import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { releasePathAllowed, validateReleaseInventory } from "./release-manifest.mjs";

const archive = path.resolve(process.argv[2] ?? "");
if (!archive.endsWith(".tar.gz")) throw Error("Usage: node scripts/verify-release.mjs RELEASE.tar.gz");
const sidecar = `${archive}.sha256`;
const expectedArchive = (await readFile(sidecar, "utf8")).trim().split(/\s+/)[0];
const actualArchive = createHash("sha256").update(await readFile(archive)).digest("hex");
if (actualArchive !== expectedArchive) throw Error("release archive checksum mismatch");

const listing = spawnSync("tar", ["-tzf", archive], { encoding: "utf8" });
if (listing.status !== 0) throw Error(listing.stderr || "cannot read release archive");
const entries = listing.stdout.trim().split("\n").filter(Boolean);
const root = entries[0]?.replace(/\/$/, "");
if (!root || entries.some(entry => entry !== root && !entry.startsWith(`${root}/`))) throw Error("release archive must contain one root directory");
for (const entry of entries) {
  const relative = entry.slice(root.length).replace(/^\//, "").replace(/\/$/, "");
  if (relative && !releasePathAllowed(relative)) throw Error(`unsafe or excluded release entry: ${entry}`);
}
const archiveFiles = entries.map(entry => entry.slice(root.length).replace(/^\//, "")).filter(relative => relative && !relative.endsWith("/"));

const temp = await mkdtemp(path.join(os.tmpdir(), "masterhost-release-verify-"));
try {
  const extracted = spawnSync("tar", ["-xzf", archive, "-C", temp], { encoding: "utf8" });
  if (extracted.status !== 0) throw Error(extracted.stderr || "cannot extract release archive");
  const stage = path.join(temp, root);
  for (const required of ["README.md", "LICENSE", "docs/INSTALL.md", "docs/OPERATIONS.md", "docs/GAME_GUIDE.md", "THIRD_PARTY_LICENSES.json", "VERSION", "SHA256SUMS"])
    await readFile(path.join(stage, required));
  const manifest = (await readFile(path.join(stage, "SHA256SUMS"), "utf8")).trim().split("\n");
  const manifestFiles = manifest.map(line => line.match(/^[a-f0-9]{64}  (.+)$/)?.[1]).filter(Boolean);
  validateReleaseInventory(archiveFiles, manifestFiles);
  for (const line of manifest) {
    const match = line.match(/^([a-f0-9]{64})  (.+)$/);
    if (!match || !releasePathAllowed(match[2])) throw Error(`invalid checksum entry: ${line}`);
    const actual = createHash("sha256").update(await readFile(path.join(stage, match[2]))).digest("hex");
    if (actual !== match[1]) throw Error(`checksum mismatch: ${match[2]}`);
  }
  const licenses = JSON.parse(await readFile(path.join(stage, "THIRD_PARTY_LICENSES.json"), "utf8"));
  if (!Array.isArray(licenses.packages) || !licenses.packages.length || licenses.packages.some(value => !value.name || !value.version || !value.license))
    throw Error("third-party license inventory is incomplete");
  const project = `masterhost-release-verify-${process.pid}`;
  const environment = { ...process.env, MASTERHOST_DB_PASSWORD: "release-verification-password", MASTERHOST_ADMIN_TOKEN: "release-verification-admin" };
  try {
    const build = spawnSync("docker", ["compose", "-p", project, "build"], { cwd: stage, env: environment, encoding: "utf8" });
    if (build.status !== 0) throw Error(`release archive Compose build failed:\n${build.stdout}\n${build.stderr}`);
  } finally {
    spawnSync("docker", ["compose", "-p", project, "down", "--rmi", "local", "--volumes", "--remove-orphans"], { cwd: stage, env: environment, encoding: "utf8" });
  }
  console.log(`Release verified and built: ${path.basename(archive)}, ${manifest.length} files, ${licenses.packages.length} dependency licenses.`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
