import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const excluded = [
  /(^|\/)\.git(\/|$)/, /(^|\/)\.env(?!\.example(?:\/|$))($|\.)/, /(^|\/)node_modules(\/|$)/,
  /(^|\/)dist(\/|$)/, /(^|\/)coverage(\/|$)/, /(^|\/)release(\/|$)/,
  /(^|\/)backups(\/|$)/, /(^|\/)[^/]+\.(dump|log)$/, /(^|\/)\.DS_Store$/, /^MasterHost-.*\.(zip|tar\.gz)$/,
];

export const requiredReleaseFiles = [
  ".env.example", "README.md", "LICENSE", "Dockerfile", "compose.yaml", "deploy/nginx.conf",
  "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "tsconfig.json", "tsconfig.base.json",
  "apps/server/package.json", "apps/server/src/index.ts", "apps/web/package.json", "apps/web/src/main.tsx",
  "packages/domain/package.json", "worldpacks/space-opera/pack.yaml", "game-assets/library/setting.json",
  "docs/INSTALL.md", "docs/OPERATIONS.md", "docs/GAME_GUIDE.md", "THIRD_PARTY_LICENSES.json", "VERSION",
  "scripts/backup.sh", "scripts/restore.sh", "scripts/diagnose.sh", "scripts/verify-release.mjs",
];

export function releasePathAllowed(value) {
  return Boolean(value) && !path.isAbsolute(value) && !value.split("/").includes("..") && excluded.every(pattern => !pattern.test(value));
}

export async function createChecksumManifest(root, files) {
  const lines = [];
  for (const name of [...new Set(files)].filter(releasePathAllowed).sort()) {
    const digest = createHash("sha256").update(await readFile(path.join(root, name))).digest("hex");
    lines.push(`${digest}  ${name}`);
  }
  return `${lines.join("\n")}\n`;
}

export function validateReleaseInventory(archiveFiles, manifestFiles) {
  const archive = new Set(archiveFiles.filter(name => name !== "SHA256SUMS"));
  const manifest = new Set(manifestFiles);
  const missing = requiredReleaseFiles.filter(name => !archive.has(name));
  if (missing.length) throw Error(`required release files missing: ${missing.join(", ")}`);
  const unmanifested = [...archive].filter(name => !manifest.has(name));
  const absent = [...manifest].filter(name => !archive.has(name));
  if (unmanifested.length) throw Error(`unmanifested release files: ${unmanifested.join(", ")}`);
  if (absent.length) throw Error(`checksum entries without release files: ${absent.join(", ")}`);
}

export async function collectThirdPartyPackages(root) {
  const store = path.join(root, "node_modules", ".pnpm"), packages = new Map();
  let entries = [];
  try { entries = await readdir(store); } catch { return []; }
  for (const entry of entries) {
    const modules = path.join(store, entry, "node_modules");
    let names = [];
    try { names = await readdir(modules); } catch { continue; }
    for (const name of names) {
      if (name.startsWith("@")) {
        for (const child of await readdir(path.join(modules, name))) await add(path.join(modules, name, child));
      } else await add(path.join(modules, name));
    }
  }
  async function add(directory) {
    try {
      const value = JSON.parse(await readFile(path.join(directory, "package.json"), "utf8"));
      if (value.name && value.version) {
        const declared = typeof value.license === "string" ? value.license : value.license?.type ?? (Array.isArray(value.licenses) ? value.licenses.map(item => typeof item === "string" ? item : item?.type).filter(Boolean).join(" OR ") : "");
        packages.set(`${value.name}@${value.version}`, { name: value.name, version: value.version, license: String(declared).trim() });
      }
    } catch {}
  }
  return [...packages.values()].sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`));
}
