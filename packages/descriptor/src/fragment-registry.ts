import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { parseFragmentPointer, type GameDescriptorFragment } from "./composition.js";

const Id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
const Scalar = z.union([z.string(), z.number(), z.boolean()]);
const Parameter = z.discriminatedUnion("type", [
  z.object({ type: z.literal("string"), required: z.boolean().optional(), default: z.string().optional(), options: z.array(z.string()).min(1).optional() }).strict(),
  z.object({ type: z.literal("number"), required: z.boolean().optional(), default: z.number().finite().optional(), min: z.number().finite().optional(), max: z.number().finite().optional() }).strict(),
  z.object({ type: z.literal("boolean"), required: z.boolean().optional(), default: z.boolean().optional() }).strict(),
]);
const Fragment = z.object({
  id: Id,
  version: z.string().trim().min(1),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500).optional(),
  provides: z.array(z.string().trim().min(1)).default([]),
  requires: z.array(z.string().trim().min(1)).default([]),
  conflicts: z.array(z.string().trim().min(1)).default([]),
  parameters: z.record(Id, Parameter).default({}),
  patches: z.array(z.object({ op: z.enum(["set", "merge", "append"]), path: z.string(), value: z.unknown() }).strict()).max(100),
}).strict();

function references(value: unknown, found = new Set<string>()) {
  if (Array.isArray(value)) for (const item of value) references(item, found);
  else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Object.keys(record).length === 1 && typeof record.$parameter === "string") found.add(record.$parameter);
    else for (const item of Object.values(record)) references(item, found);
  }
  return found;
}

export function validateGameDescriptorFragment(input: unknown): GameDescriptorFragment {
  if (input && typeof input === "object" && "id" in input && (typeof (input as any).id !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test((input as any).id))) throw Error("invalid fragment id");
  if (input && typeof input === "object" && "parameters" in input) for (const definition of Object.values((input as any).parameters ?? {})) if (!definition || !["string", "number", "boolean"].includes((definition as any).type)) throw Error("invalid fragment parameter type");
  const result = Fragment.safeParse(input);
  if (!result.success) {
    const tooMany = result.error.issues.find(issue => issue.path[0] === "patches" && issue.code === "too_big");
    if (tooMany) throw Error("fragment may contain at most 100 patches");
    throw Error(`invalid fragment: ${result.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
  }
  const fragment = result.data as GameDescriptorFragment;
  for (const [index, patch] of fragment.patches.entries()) {
    try { parseFragmentPointer(patch.path); }
    catch (error) { throw Error(`unsafe JSON Pointer in patch ${index}: ${error instanceof Error ? error.message : "invalid path"}`); }
    if (Buffer.byteLength(JSON.stringify(patch.value), "utf8") > 256 * 1024) throw Error(`patch ${index} exceeds 256 KiB`);
    for (const key of references(patch.value)) if (!fragment.parameters[key]) throw Error(`unknown parameter reference ${key}`);
  }
  for (const [key, definition] of Object.entries(fragment.parameters)) {
    if (definition.type === "number" && definition.min !== undefined && definition.max !== undefined && definition.min > definition.max) throw Error(`parameter ${key} minimum exceeds maximum`);
    if (definition.default !== undefined && !Scalar.safeParse(definition.default).success) throw Error(`parameter ${key} default must be scalar`);
  }
  return structuredClone(fragment);
}

export interface FragmentCatalogEntry {
  id: string;
  version: string;
  name: string;
  description?: string;
  provides: string[];
  requires: string[];
  conflicts: string[];
  parameters: GameDescriptorFragment["parameters"];
  parameterCount: number;
}

export async function loadFragmentRegistry(root: string) {
  const names = (await readdir(root)).filter(name => name.endsWith(".json")).sort(), fragments: GameDescriptorFragment[] = [], seen = new Set<string>();
  for (const name of names) {
    const fragment = validateGameDescriptorFragment(JSON.parse(await readFile(join(root, name), "utf8"))), identity = `${fragment.id}@${fragment.version}`;
    if (seen.has(identity)) throw Error(`duplicate fragment ${identity}`);
    seen.add(identity); fragments.push(fragment);
  }
  return fragments.sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id));
}

export function fragmentCatalog(fragments: GameDescriptorFragment[]): FragmentCatalogEntry[] {
  return fragments.map(({ id, version, name, description, provides, requires, conflicts, parameters }) => ({ id, version, name, description, provides: [...provides], requires: [...requires], conflicts: [...conflicts], parameters: structuredClone(parameters), parameterCount: Object.keys(parameters).length }));
}
