import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectThirdPartyPackages, createChecksumManifest, createReleaseArchive, releasePathAllowed } from "./release-manifest.mjs";

const root = fileURLToPath(new URL("..", import.meta.url)), version = process.argv[2] ?? "0.1.0", output = path.resolve(process.argv[3] ?? path.join(root, "release"));
if (!/^[0-9A-Za-z][0-9A-Za-z._-]{0,63}$/.test(version)) throw Error("release version must use letters, numbers, dot, underscore or dash");
const listed = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { cwd: root, encoding: "utf8" });
if (listed.status !== 0) throw Error(listed.stderr || "git file inventory failed");
const files = listed.stdout.split("\0").filter(releasePathAllowed), temp = await mkdtemp(path.join(os.tmpdir(), "masterhost-release-")), folder = `masterhost-${version}`, stage = path.join(temp, folder);
try {
  for (const name of files) { const target = path.join(stage, name); await mkdir(path.dirname(target), { recursive: true }); await cp(path.join(root, name), target); }
  const licenses = await collectThirdPartyPackages(root);
  if (!licenses.length || licenses.some(value => !value.license)) throw Error("third-party license inventory is incomplete");
  await writeFile(path.join(stage, "THIRD_PARTY_LICENSES.json"), `${JSON.stringify({ packages: licenses }, null, 2)}\n`);
  await writeFile(path.join(stage, "VERSION"), `${version}\n`);
  const releaseFiles = [...files, "THIRD_PARTY_LICENSES.json", "VERSION"];
  await writeFile(path.join(stage, "SHA256SUMS"), await createChecksumManifest(stage, releaseFiles));
  await mkdir(output, { recursive: true });
  const archive = path.join(output, `${folder}.tar.gz`);
  createReleaseArchive(temp, folder, archive);
  const checksum = (await createChecksumManifest(output, [path.basename(archive)])).trim();
  await writeFile(`${archive}.sha256`, `${checksum}\n`);
  console.log(JSON.stringify({ archive, checksum, files: releaseFiles.length, dependencies: licenses.length }));
} finally { await rm(temp, { recursive: true, force: true }); }
