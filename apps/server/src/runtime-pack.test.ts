import { describe, expect, it } from "vitest";
import { resolveRuntimeWorldPack } from "./runtime.js";

const pack = (id: string, version: string) => ({ manifest: { id, version } }) as any;

describe("runtime World Pack resolution", () => {
  it("uses the Pack compiled into a composed game instead of the Realm active Pack", async () => {
    const realmPack = pack("masterhost.classic-fantasy", "2.0.0");
    const gamePack = pack("masterhost.game.demo", "0.1.1");
    const world = { packId: "masterhost.game.demo", packVersion: "0.1.1" } as any;

    await expect(resolveRuntimeWorldPack(world, realmPack, async () => gamePack)).resolves.toBe(gamePack);
  });

  it("rejects a resolver result that does not match the saved game", async () => {
    const world = { packId: "masterhost.game.demo", packVersion: "0.1.1" } as any;
    await expect(resolveRuntimeWorldPack(world, pack("masterhost.classic-fantasy", "2.0.0"), async () => pack("wrong", "1.0.0"))).rejects.toThrow(/unavailable/);
  });
});
