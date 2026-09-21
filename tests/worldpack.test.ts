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
    expect(pack.content.actorTemplates?.goblin.worldEntityKinds).toEqual(["creature"]);
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
  it("rejects actor links to World kinds absent from the Pack", async () => {
    const root = await mkdtemp(join(tmpdir(), "masterhost-pack-"));
    try {
      await copyFile(join(fixture, "manifest.yaml"), join(root, "manifest.yaml"));
      const content = await readFile(join(fixture, "pack.yaml"), "utf8");
      await writeFile(join(root, "pack.yaml"), content.replace("worldEntityKinds: [creature]", "worldEntityKinds: [starship]"));
      await expect(loadWorldPack(root)).rejects.toThrow("unknown World entity kind starship");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
  it("rejects invalid runtime capabilities before a Session starts", async () => {
    const root = await mkdtemp(join(tmpdir(), "masterhost-pack-"));
    try {
      await copyFile(join(fixture, "manifest.yaml"), join(root, "manifest.yaml"));
      const content = await readFile(join(fixture, "pack.yaml"), "utf8");
      const cases: Array<[string, string, RegExp]> = [
        ["dice: 1d20", "dice: 1d1", /Check perception: dice limits exceeded/],
        ["modifierField: perception", "modifierField: missing", /modifier field missing must be a numeric Character field/],
        ["default: 20", "default: 90", /Resource health: default outside bounds/],
        ["{ type: turns, value: 3 }", "{ type: turns }", /Effect poisoned: timed duration requires value/],
        ["modifiers: { perception: -2, athletics: -1 }", "modifiers: { perceptoin: -2, athletics: -1 }", /Effect poisoned: modifier perceptoin has no numeric Character or Actor field/],
        ["target: actor, resource: health, operation: subtract, amount: 5", "target: actor, resource: health, operation: subtract", /Action take-damage: legacy kind has no valid executable definition/],
        ["damage.total", "missing.total", /Action sword-strike step 3: unavailable numeric reference missing.total/],
        ["target: single-actor", "target: none", /Action sword-strike step 3: target actor is unavailable/],
        ["- check: { id: athletics, against: input.difficulty }", "- when: { previousOutcome: success }\n        check: { id: athletics, against: input.difficulty }", /Action sword-strike step 1: conditional step requires a preceding Check/],
        ["- when: { previousOutcome: success }\n        resource: { target: target, resource: health, operation: subtract, value: damage.total }", "- when: { previousOutcome: failure }\n        resource: { target: target, resource: health, operation: subtract, value: damage.total }", /unavailable numeric reference damage.total/],
        ["roll: { id: damage, dice: 1d8 }", "roll: { id: damage, dice: 1d8 }\n        effect: { target: target, id: inspired }", /Unrecognized key|Invalid input/],
        ["orderingPolicy: fixed", "orderingPolicy: attribute", /Encounter: attribute ordering requires a numeric Character field/],
      ];
      for (const [before, after, error] of cases) {
        expect(content).toContain(before);
        await writeFile(join(root, "pack.yaml"), content.replace(before, after));
        await expect(loadWorldPack(root)).rejects.toThrow(error);
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
