import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { loadWorldPack } from "@masterhost/worldpack-sdk";
import { compileWorld, customizeValue, regenerateWorld } from "@masterhost/world-compiler";

const descriptor = (pack: Awaited<ReturnType<typeof loadWorldPack>>) => ({
  schemaVersion: "0.1",
  worldPack: { id: pack.manifest.id, version: pack.manifest.version },
  decisions: {}, locks: [], seedPolicy: "explicit" as const, seed: "42"
});

describe("compiler", () => {
  it("same seed gives same generated values", async () => {
    const pack = await loadWorldPack(resolve("worldpacks/classic-fantasy-test"));
    const args = { realmId: "r", descriptor: descriptor(pack), pack, seed: "42", worldId: "w" };
    const a = compileWorld(args), b = compileWorld(args);
    expect(a.entities.map(e => [e.materializationPath, e.values])).toEqual(b.entities.map(e => [e.materializationPath, e.values]));
  });
  it("custom locked values survive regeneration", async () => {
    const pack = await loadWorldPack(resolve("worldpacks/classic-fantasy-test"));
    let world = compileWorld({ realmId: "r", descriptor: descriptor(pack), pack, seed: "42", worldId: "w" });
    const settlement = world.entities.find(e => e.kind === "settlement")!;
    world = customizeValue(world, settlement.id, "name", "MyTown", true);
    world = regenerateWorld({ world, pack });
    expect(world.entities.find(e => e.materializationPath === settlement.materializationPath)?.values.name?.value).toBe("MyTown");
  });
});
