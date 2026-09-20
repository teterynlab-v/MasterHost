import { describe,it,expect } from "vitest";
import { loadWorldPack,validateWorldPack } from "../packages/worldpack-sdk/src";
import { resolve } from "node:path";
describe("world pack",()=>{it("loads and validates fixture",async()=>{const p=await loadWorldPack(resolve("worldpacks/classic-fantasy-test"));expect(validateWorldPack(p).valid).toBe(true);expect(p.manifest.entryTemplate).toBe("world.default")})});
