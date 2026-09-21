import { describe, expect, it } from "vitest";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { collectThirdPartyPackages, createChecksumManifest, releasePathAllowed, requiredReleaseFiles, validateReleaseInventory } from "../scripts/release-manifest.mjs";

describe("M16 release engineering", () => {
  it("excludes local state and generated output from release archives", () => {
    expect(releasePathAllowed("README.md")).toBe(true);
    expect(releasePathAllowed(".env.example")).toBe(true);
    expect(releasePathAllowed("worldpacks/space-opera/pack.yaml")).toBe(true);
    for (const value of [".env", ".env.local", ".git/config", "node_modules/x", "apps/web/dist/index.html", "release/a.tar.gz", "backups/masterhost.dump", "local.dump", "api.log", ".DS_Store"])
      expect(releasePathAllowed(value)).toBe(false);
  });

  it("requires install assets and a checksum for every release file", () => {
    const required = [...requiredReleaseFiles];
    expect(() => validateReleaseInventory([...required, "UNMANIFESTED.txt", "SHA256SUMS"], required)).toThrow(/unmanifested/i);
    expect(() => validateReleaseInventory(required.filter(name => name !== "Dockerfile"), required.filter(name => name !== "Dockerfile"))).toThrow(/required/i);
    expect(() => validateReleaseInventory([...required, "SHA256SUMS"], required)).not.toThrow();
  });

  it("creates stable SHA-256 evidence", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "masterhost-release-test-"));
    await writeFile(path.join(root, "a.txt"), "alpha");
    await mkdir(path.join(root, "docs"));
    await writeFile(path.join(root, "docs", "b.txt"), "beta");
    const first = await createChecksumManifest(root, ["docs/b.txt", "a.txt"]);
    const second = await createChecksumManifest(root, ["a.txt", "docs/b.txt"]);
    expect(first).toBe(second);
    expect(first.split("\n")[0]).toMatch(/^[a-f0-9]{64}  a\.txt$/);
  });

  it("collects dependency licenses without duplicate package versions", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "masterhost-license-test-"));
    const base = path.join(root, "node_modules", ".pnpm", "demo@1.0.0", "node_modules", "demo");
    await mkdir(base, { recursive: true });
    await writeFile(path.join(base, "package.json"), JSON.stringify({ name: "demo", version: "1.0.0", license: "MIT" }));
    const unknown = path.join(root, "node_modules", ".pnpm", "unknown@2.0.0", "node_modules", "unknown");
    await mkdir(unknown, { recursive: true });
    await writeFile(path.join(unknown, "package.json"), JSON.stringify({ name: "unknown", version: "2.0.0" }));
    expect(await collectThirdPartyPackages(root)).toEqual([
      { name: "demo", version: "1.0.0", license: "MIT" },
      { name: "unknown", version: "2.0.0", license: "" },
    ]);
  });
});
