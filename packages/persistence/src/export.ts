import { createHash } from "node:crypto";
import type { MaterializedWorld } from "@masterhost/domain";

export interface MhWorldPackage { format:"masterhost.world"; formatVersion:"0.1"; exportedAt:string; checksum:string; world:MaterializedWorld }
const hash=(s:string)=>createHash("sha256").update(s).digest("hex");
export function exportWorld(world:MaterializedWorld):MhWorldPackage{
  const payload=JSON.stringify(world);
  return {format:"masterhost.world",formatVersion:"0.1",exportedAt:new Date().toISOString(),checksum:hash(payload),world:structuredClone(world)};
}
export function importWorld(input:unknown):MaterializedWorld{
  const p=input as MhWorldPackage;
  if(p?.format!=="masterhost.world"||p?.formatVersion!=="0.1"||!p.world)throw Error("Unsupported .mhworld package");
  if(hash(JSON.stringify(p.world))!==p.checksum)throw Error(".mhworld checksum mismatch");
  return structuredClone(p.world);
}
