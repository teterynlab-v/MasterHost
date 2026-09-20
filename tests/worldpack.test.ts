import { describe, it, expect } from "vitest";
import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { loadWorldPack, validateWorldPack } from "../packages/worldpack-sdk/src";

const fixture = resolve("worldpacks/classic-fantasy-test");

describe("world pack", () => {
  it("loads and validates fixture", async () => {
    const pack = await loadWorldPack(fixture);
    expect(validateWorldPack(pack).valid).toBe(true);
    expect(pack.manifest.entryTemplate).toBe("world.default");
    expect(pack.content.actorTemplates?.goblin.resources?.health).toBe(8);
  });

  it("rejects actor templates with unknown or out-of-bounds resources", async () => {
    const root = await mkdtemp(join(tmpdir(), "masterhost-pack-"));
    try {
      await copyFile(join(fixture, "manifest.yaml"), join(root, "manifest.yaml"));
      const content = await readFile(join(fixture, "pack.yaml"), "utf8");
      const original = "goblin: { label: Goblin, resources: { health: 8";
      expect(content).toContain(original);
      await writeFile(join(root, "pack.yaml"), content.replace(original, "goblin: { label: Goblin, resources: { missing: 8"));
      await expect(loadWorldPack(root)).rejects.toThrow("unknown resource missing");
      await writeFile(join(root, "pack.yaml"), content.replace(original, "goblin: { label: Goblin, resources: { health: 80"));
      await expect(loadWorldPack(root)).rejects.toThrow("resource health outside bounds");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
