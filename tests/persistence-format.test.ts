import { describe,it,expect } from "vitest";
import { exportWorld,importWorld } from "../packages/persistence/src/export";
import type { MaterializedWorld } from "../packages/domain/src";
const world:MaterializedWorld={id:"w",realmId:"r",name:"Test",packId:"p",packVersion:"0.1.0",descriptor:{schemaVersion:"0.1",worldPack:{id:"p",version:"0.1.0"},decisions:{},locks:[],seedPolicy:"explicit",seed:"s"},seed:"s",status:"draft",entities:[],revision:1,createdAt:"x",updatedAt:"x"};
describe("mhworld format",()=>{it("round trips",()=>{const p=exportWorld(world);expect(importWorld(p)).toEqual(world)});it("detects tampering",()=>{const p=exportWorld(world);p.world.name="tampered";expect(()=>importWorld(p)).toThrow(/checksum/)})});
