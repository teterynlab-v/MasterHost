import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { z } from "zod";
import { validateGameDescriptorFragment } from "./fragment-registry.js";
import type { GameDescriptorFragment } from "./composition.js";

const Id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/), Version = z.string().regex(/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/), safePath = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/;
const License = z.object({ spdx: z.enum(["CC0-1.0", "CC-BY-4.0", "MIT", "Apache-2.0", "OFL-1.1"]), attribution: z.string().trim().min(1), source: z.string().trim().min(1) }).strict();
const Media = z.object({ name: z.string().min(1), path: z.string().min(1), role: z.enum(["map", "portrait", "token", "background", "item", "location", "card"]), mediaType: z.enum(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]), checksum: z.string().regex(/^[a-f0-9]{64}$/), size: z.number().int().positive().max(2_000_000) }).strict();
const Counts = z.object({ locations: z.number().int().nonnegative().default(0), actors: z.number().int().nonnegative().default(0), items: z.number().int().nonnegative().default(0), scenes: z.number().int().nonnegative().default(0), archetypes: z.number().int().nonnegative().default(0), rules: z.number().int().nonnegative().default(0), media: z.number().int().nonnegative().default(0) }).strict();
const Asset = z.object({ schemaVersion: z.literal("1"), id: Id, version: Version, type: z.enum(["setting", "world-template", "locations", "cast", "items", "adventure", "characters", "rules", "visuals"]), name: z.string().trim().min(1).max(120), description: z.string().trim().min(1).max(1000), tags: z.array(Id).min(1), preview: z.object({ summary: z.string().trim().min(1), highlights: z.array(z.string().trim().min(1)).min(1) }).strict(), compatibility: z.object({ basePackIds: z.array(Id).min(1), requiresCapabilities: z.array(z.string()).default([]), providesCapabilities: z.array(z.string()).default([]), conflicts: z.array(z.string()).default([]) }).strict(), dependencies: z.array(z.object({ id: Id, version: Version }).strict()).default([]), license: License, published: z.literal(true), lineage: z.object({ forkedFrom: Id, version: Version }).strict().optional(), counts: Counts, media: z.array(Media).default([]), fragment: z.unknown() }).strict();

export interface GameAssetMedia { name: string; path: string; role: "map" | "portrait" | "token" | "background" | "item" | "location" | "card"; mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml"; checksum: string; size: number; absolutePath: string }
export interface GameAsset { schemaVersion: "1"; id: string; version: string; type: "setting" | "world-template" | "locations" | "cast" | "items" | "adventure" | "characters" | "rules" | "visuals"; name: string; description: string; tags: string[]; preview: { summary: string; highlights: string[] }; compatibility: { basePackIds: string[]; requiresCapabilities: string[]; providesCapabilities: string[]; conflicts: string[] }; dependencies: { id: string; version: string }[]; license: { spdx: string; attribution: string; source: string }; published: true; lineage?: { forkedFrom: string; version: string }; counts: { locations: number; actors: number; items: number; scenes: number; archetypes: number; rules: number; media: number }; media: GameAssetMedia[]; fragment: GameDescriptorFragment; contentChecksum: string }
export interface GameAssetCatalogQuery { query?: string; type?: string; tag?: string; basePackId?: string }

const sha = (value: Uint8Array | string) => createHash("sha256").update(value).digest("hex"), pointer = (value: string) => value.replaceAll("~", "~0").replaceAll("/", "~1");
const mediaMatches = (bytes: Buffer, mediaType: GameAssetMedia["mediaType"]) => mediaType === "image/png" ? bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) : mediaType === "image/jpeg" ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff : mediaType === "image/webp" ? bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP" : /^\s*(?:<\?xml[^>]*>\s*)?<svg[\s/>]/i.test(bytes.toString("utf8"));
const publicAsset = (asset: GameAsset) => ({ ...asset, fragment: { id: asset.fragment.id, version: asset.fragment.version, provides: asset.fragment.provides, requires: asset.fragment.requires, conflicts: asset.fragment.conflicts, parameters: asset.fragment.parameters, defaultArtSet: asset.fragment.defaultArtSet }, media: asset.media.map(({ absolutePath: _path, ...media }) => media) });

export async function loadGameAssetRegistry(root: string): Promise<GameAsset[]> {
  const names = (await readdir(root)).filter(name => name.endsWith(".json")).sort(), assets: GameAsset[] = [], identities = new Set<string>();
  for (const name of names) {
    const raw = JSON.parse(await readFile(join(root, name), "utf8")), parsed = Asset.parse(raw), fragment = validateGameDescriptorFragment(parsed.fragment);
    if (fragment.id !== parsed.id || fragment.version !== parsed.version) throw Error(`asset ${parsed.id} fragment identity must match the asset`);
    const same = (left: string[], right: string[]) => JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
    if (!same(fragment.provides, parsed.compatibility.providesCapabilities) || !same(fragment.requires, parsed.compatibility.requiresCapabilities) || !same(fragment.conflicts, parsed.compatibility.conflicts)) throw Error(`asset ${parsed.id} compatibility metadata does not match its fragment`);
    const identity = `${parsed.id}@${parsed.version}`; if (identities.has(identity)) throw Error(`duplicate asset ${identity}`); identities.add(identity);
    const media: GameAssetMedia[] = [];
    for (const item of parsed.media) {
      if (!safePath.test(item.path) || item.path.includes("..") || isAbsolute(item.path) || !safePath.test(item.name) || item.name.includes("..")) throw Error(`unsafe asset media path ${item.path}`);
      const absolutePath = join(root, item.path), bytes = await readFile(absolutePath).catch(() => null); if (!bytes) throw Error(`missing asset media ${item.path}`);
      if (bytes.length !== item.size || sha(bytes) !== item.checksum) throw Error(`asset media checksum or size mismatch ${item.path}`);
      if (!mediaMatches(bytes, item.mediaType)) throw Error(`asset media type mismatch ${item.path}`);
      media.push({ ...item, absolutePath });
      fragment.patches.push({ op: "set", path: `/assets/${pointer(item.name)}`, value: { mediaType: item.mediaType, checksum: item.checksum, size: item.size } });
    }
    if (parsed.counts.media !== media.length) throw Error(`asset ${parsed.id} media count does not match declarations`);
    assets.push({ ...parsed, fragment, media, contentChecksum: sha(JSON.stringify(parsed)) } as GameAsset);
  }
  const byIdentity = new Map(assets.map(asset => [`${asset.id}@${asset.version}`, asset]));
  for (const asset of assets) for (const dependency of asset.dependencies) {
    const target = byIdentity.get(`${dependency.id}@${dependency.version}`); if (!target) throw Error(`asset ${asset.id} has missing dependency ${dependency.id}@${dependency.version}`);
    if (!asset.fragment.requires.some(capability => target.fragment.provides.includes(capability))) throw Error(`asset ${asset.id} dependency ${dependency.id} provides none of its required capabilities`);
  }
  const visit = (asset: GameAsset, trail: string[]) => { if (trail.includes(asset.id)) throw Error(`asset dependency cycle ${[...trail, asset.id].join(" -> ")}`); for (const dependency of asset.dependencies) visit(byIdentity.get(`${dependency.id}@${dependency.version}`)!, [...trail, asset.id]); };
  for (const asset of assets) visit(asset, []);
  return assets.sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id));
}

export function gameAssetCatalog(assets: GameAsset[], filters: GameAssetCatalogQuery = {}) {
  const query = filters.query?.trim().toLowerCase() ?? "";
  return assets.filter(asset => !filters.type || asset.type === filters.type).filter(asset => !filters.tag || asset.tags.includes(filters.tag)).filter(asset => !filters.basePackId || asset.compatibility.basePackIds.includes(filters.basePackId)).filter(asset => !query || `${asset.name} ${asset.description} ${asset.tags.join(" ")} ${asset.preview.highlights.join(" ")}`.toLowerCase().includes(query)).map(publicAsset);
}
export const gameAssetFragments = (assets: GameAsset[]) => assets.map(asset => structuredClone(asset.fragment));
export const gameAssetMedia = (assets: GameAsset[], name: string, checksum?: string) => assets.flatMap(asset => asset.media).find(media => media.name === name && (!checksum || media.checksum === checksum));
export const gameAssetDetail = (assets: GameAsset[], id: string, version: string) => { const asset = assets.find(value => value.id === id && value.version === version); return asset ? publicAsset(asset) : null; };
