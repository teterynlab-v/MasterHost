import { createHash } from "node:crypto";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { z } from "zod";
import type { MaterializedWorld } from "@masterhost/domain";
import type { GameFragmentSelection } from "@masterhost/descriptor";
import type { WorldPackProject } from "@masterhost/worldpack-sdk";
import { exportMhPack, importMhPack } from "./mhpack.js";
import { exportMhWorldZip, importMhWorldZipWithAssets } from "./mhworld-zip.js";

const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const safePath = (path: string) => { try { const decoded = decodeURIComponent(path); return Boolean(path) && !path.startsWith("/") && !decoded.startsWith("/") && !path.includes("\\") && !decoded.includes("\\") && !decoded.split("/").some(part => part === "." || part === ".."); } catch { return false; } };
const Identity = z.object({ id: z.string().min(1), version: z.string().min(1) }).strict();
const AssetEvidence = z.object({ schemaVersion: z.string(), id: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/), version: z.string(), type: z.string(), name: z.string(), contentChecksum: z.string().regex(/^[a-f0-9]{64}$/), license: z.object({ spdx: z.string(), attribution: z.string(), source: z.string() }).strict() }).passthrough();
const DescriptorProject = z.object({ id: z.string(), name: z.string(), revision: z.number().int().positive(), seed: z.string(), basePack: Identity, selections: z.array(z.object({ fragmentId: z.string(), version: z.string(), parameters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])) }).strict()), decisions: z.record(z.string(), z.unknown()), locks: z.array(z.string()) }).strict();
const Manifest = z.object({ format: z.literal("masterhost.game"), formatVersion: z.literal("0.1"), packageId: z.string().uuid(), name: z.string().min(1).max(160), exportedAt: z.iso.datetime(), sourceWorld: z.object({ id: z.string().uuid(), revision: z.number().int().positive() }).strict(), descriptorProject: DescriptorProject.optional() }).strict();
const Lock = z.object({ pack: Identity, assets: z.array(Identity.extend({ contentChecksum: z.string().regex(/^[a-f0-9]{64}$/) })), media: z.record(z.string(), z.string().regex(/^[a-f0-9]{64}$/)) }).strict();
const Attribution = z.array(z.object({ kind: z.enum(["pack", "asset"]), id: z.string(), version: z.string(), spdx: z.string().min(1), attribution: z.string().min(1), source: z.string().min(1) }).strict()).min(1);

export type MhGameAssetEvidence = z.infer<typeof AssetEvidence>;
export type MhGameDependencyLock = z.infer<typeof Lock>;
export type MhGameAttribution = z.infer<typeof Attribution>;
export interface MhGameDescriptorProject { id: string; name: string; revision: number; seed: string; basePack: { id: string; version: string }; selections: GameFragmentSelection[]; decisions: Record<string, unknown>; locks: string[] }
export interface MhGameExportInput { packageId: string; name: string; exportedAt?: string; packProject: WorldPackProject; world: MaterializedWorld; worldAssets: Record<string, Uint8Array>; descriptorProject?: MhGameDescriptorProject; gameAssets: MhGameAssetEvidence[]; dependencyLock: MhGameDependencyLock; attribution: MhGameAttribution }
export interface ImportedMhGame { manifest: z.infer<typeof Manifest>; runtimePack: WorldPackProject; world: MaterializedWorld; worldAssets: Record<string, Uint8Array>; descriptorProject?: MhGameDescriptorProject; gameAssets: MhGameAssetEvidence[]; dependencyLock: MhGameDependencyLock; attribution: MhGameAttribution }

function scanZip(bytes: Uint8Array) {
  if (bytes.length > 25_000_000) throw Error("mhgame archive exceeds 25 MB limit");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); let end = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65_557); offset--) if (view.getUint32(offset, true) === 0x06054b50) { end = offset; break; }
  if (end < 0) throw Error("Invalid mhgame ZIP directory");
  const count = view.getUint16(end + 10, true), size = view.getUint32(end + 12, true), offset = view.getUint32(end + 16, true);
  if (count > 128 || offset + size > bytes.length) throw Error("Invalid or oversized mhgame ZIP directory");
  let position = offset, total = 0; const names = new Set<string>();
  for (let index = 0; index < count; index++) {
    if (position + 46 > bytes.length || view.getUint32(position, true) !== 0x02014b50) throw Error("Invalid mhgame ZIP entry");
    if (view.getUint16(position + 8, true) & 1) throw Error("Encrypted mhgame entries are unsupported");
    const expanded = view.getUint32(position + 24, true), nameLength = view.getUint16(position + 28, true), extraLength = view.getUint16(position + 30, true), commentLength = view.getUint16(position + 32, true), name = new TextDecoder().decode(bytes.slice(position + 46, position + 46 + nameLength));
    if (!safePath(name) || names.has(name)) throw Error(`Unsafe or duplicate mhgame path ${name}`);
    names.add(name); total += expanded; if (expanded > 25_000_000 || total > 100_000_000) throw Error("mhgame uncompressed size limit exceeded");
    position += 46 + nameLength + extraLength + commentLength;
  }
  if (position !== offset + size) throw Error("Invalid mhgame ZIP directory size");
}

function validateEvidence(pack: WorldPackProject, world: MaterializedWorld, assets: MhGameAssetEvidence[], lock: MhGameDependencyLock, attribution: MhGameAttribution, descriptor?: MhGameDescriptorProject) {
  const identity = pack.document.manifest;
  if (world.packId !== identity.id || world.packVersion !== identity.version || world.descriptor.worldPack.id !== identity.id || world.descriptor.worldPack.version !== identity.version) throw Error("mhgame Pack identity mismatch");
  if (lock.pack.id !== identity.id || lock.pack.version !== identity.version) throw Error("mhgame dependency lock Pack identity mismatch");
  const lockedAssets = new Map(lock.assets.map(value => [`${value.id}@${value.version}`, value.contentChecksum])), evidence = new Map(assets.map(value => [`${value.id}@${value.version}`, value.contentChecksum]));
  if (lockedAssets.size !== evidence.size || [...lockedAssets].some(([key, digest]) => evidence.get(key) !== digest)) throw Error("mhgame asset evidence does not match dependency lock");
  if (descriptor) { const selected = new Set(descriptor.selections.map(value => `${value.fragmentId}@${value.version}`)); if (selected.size !== lockedAssets.size || [...selected].some(value => !lockedAssets.has(value))) throw Error("mhgame GM selections do not match dependency lock"); }
  const media = Object.fromEntries(Object.entries(pack.document.assets).map(([name, value]) => [name, value.checksum]));
  if (JSON.stringify(Object.entries(media).sort()) !== JSON.stringify(Object.entries(lock.media).sort())) throw Error("mhgame media lock mismatch");
  const credited = new Set(attribution.map(value => `${value.kind}:${value.id}@${value.version}`));
  if (!credited.has(`pack:${identity.id}@${identity.version}`) || assets.some(value => !credited.has(`asset:${value.id}@${value.version}`))) throw Error("mhgame attribution is incomplete");
}

export function exportMhGame(input: MhGameExportInput): Uint8Array {
  const gameAssets = input.gameAssets.map(value => AssetEvidence.parse(value)), dependencyLock = Lock.parse(input.dependencyLock), attribution = Attribution.parse(input.attribution), descriptorProject = input.descriptorProject ? DescriptorProject.parse(input.descriptorProject) : undefined;
  validateEvidence(input.packProject, input.world, gameAssets, dependencyLock, attribution, descriptorProject);
  const manifest = Manifest.parse({ format: "masterhost.game", formatVersion: "0.1", packageId: input.packageId, name: input.name, exportedAt: input.exportedAt ?? new Date().toISOString(), sourceWorld: { id: input.world.id, revision: input.world.revision }, ...(descriptorProject ? { descriptorProject } : {}) });
  const files: Record<string, Uint8Array> = { "game.json": strToU8(JSON.stringify(manifest, null, 2)), "pack.mhpack": exportMhPack(input.packProject), "world.mhworld": exportMhWorldZip(input.world, input.worldAssets), "dependencies.lock.json": strToU8(JSON.stringify(dependencyLock, null, 2)), "attribution.json": strToU8(JSON.stringify(attribution, null, 2)) };
  for (const asset of gameAssets) files[`game-assets/${asset.id}@${asset.version}.json`] = strToU8(JSON.stringify(asset, null, 2));
  files["checksums.json"] = strToU8(JSON.stringify(Object.fromEntries(Object.entries(files).map(([name, data]) => [name, sha(data)])), null, 2));
  return zipSync(files, { level: 6 });
}

export function inspectMhGame(bytes: Uint8Array, realmId: string): ImportedMhGame {
  scanZip(bytes); const raw = unzipSync(bytes), allowed = Object.keys(raw), required = ["game.json", "pack.mhpack", "world.mhworld", "dependencies.lock.json", "checksums.json"];
  if (!raw["checksums.json"]) throw Error("Missing mhgame entry checksums.json");
  const checksums = JSON.parse(strFromU8(raw["checksums.json"]!)) as Record<string, string>, signed = allowed.filter(name => name !== "checksums.json");
  if (signed.some(name => !checksums[name]) || Object.keys(checksums).some(name => !signed.includes(name))) throw Error("mhgame checksum manifest does not match archive");
  for (const [name, digest] of Object.entries(checksums)) if (sha(raw[name]!) !== digest) throw Error(`mhgame checksum mismatch ${name}`);
  const initial = JSON.parse(strFromU8(raw["game.json"] ?? new Uint8Array())) as { format?: string; formatVersion?: string };
  if (initial.format !== "masterhost.game" || !["0.0", "0.1"].includes(String(initial.formatVersion))) throw Error("unsupported mhgame format");
  const attributionName = initial.formatVersion === "0.0" ? "licenses.json" : "attribution.json"; required.push(attributionName);
  for (const name of allowed) if (!safePath(name) || !required.includes(name) && !name.startsWith("game-assets/")) throw Error(`Unsafe mhgame entry ${name}`);
  for (const name of required) if (!raw[name]) throw Error(`Missing mhgame entry ${name}`);
  const migrated = { ...initial, formatVersion: "0.1" }, manifest = Manifest.parse(migrated), runtimePack = importMhPack(raw["pack.mhpack"]!, realmId), importedWorld = importMhWorldZipWithAssets(raw["world.mhworld"]!, realmId), dependencyLock = Lock.parse(JSON.parse(strFromU8(raw["dependencies.lock.json"]!))), attribution = Attribution.parse(JSON.parse(strFromU8(raw[attributionName]!))), gameAssets = allowed.filter(name => name.startsWith("game-assets/")).sort().map(name => AssetEvidence.parse(JSON.parse(strFromU8(raw[name]!))));
  const descriptorProject = manifest.descriptorProject as MhGameDescriptorProject | undefined;
  validateEvidence(runtimePack, importedWorld.world, gameAssets, dependencyLock, attribution, descriptorProject);
  return { manifest, runtimePack, world: importedWorld.world, worldAssets: importedWorld.assets, descriptorProject, gameAssets, dependencyLock, attribution };
}
