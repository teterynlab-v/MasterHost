import { WorldPackDocumentSchema, type WorldPackDocument } from "@masterhost/worldpack-sdk";

export type FragmentParameter =
  | { type: "string"; required?: boolean; default?: string; options?: string[] }
  | { type: "number"; required?: boolean; default?: number; min?: number; max?: number }
  | { type: "boolean"; required?: boolean; default?: boolean };

export type FragmentValue = unknown;
export interface FragmentPatch { op: "set" | "merge" | "append"; path: string; value: FragmentValue }
export interface GameDescriptorFragment {
  id: string;
  version: string;
  name: string;
  description?: string;
  provides: string[];
  requires: string[];
  conflicts: string[];
  defaultArtSet?: string;
  parameters: Record<string, FragmentParameter>;
  patches: FragmentPatch[];
}
export interface GameFragmentSelection { fragmentId: string; version: string; parameters: Record<string, string | number | boolean> }
export interface CompositionDiagnostic { code: "fragment" | "version" | "parameter" | "capability" | "conflict" | "path" | "write-conflict" | "pack"; path: string; message: string }
export interface CompositionReport { valid: boolean; diagnostics: CompositionDiagnostic[]; selected: { id: string; version: string }[]; providedCapabilities: string[]; writes: string[] }
export interface ComposeGameDescriptorInput { projectId: string; revision: number; name: string; base: WorldPackDocument; fragments: GameDescriptorFragment[]; selections: GameFragmentSelection[] }

const unsafe = new Set(["__proto__", "prototype", "constructor"]);
const pointerEscape = (value: string) => value.replaceAll("~", "~0").replaceAll("/", "~1");

export function assertSafeFragmentValue(value: unknown, seen = new WeakSet<object>()) {
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) throw Error("patch value must not contain cycles");
  seen.add(value);
  if (Array.isArray(value)) for (const item of value) assertSafeFragmentValue(item, seen);
  else for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (unsafe.has(key)) throw Error(`unsafe patch value key ${key}`);
    assertSafeFragmentValue(item, seen);
  }
  seen.delete(value);
}

export function parseFragmentPointer(pointer: string) {
  if (!pointer.startsWith("/")) throw Error("JSON Pointer must start with /");
  const segments = pointer.slice(1).split("/").map(value => value.replaceAll("~1", "/").replaceAll("~0", "~"));
  if (segments.some(value => !value)) throw Error("JSON Pointer contains an empty segment");
  for (const segment of segments) if (unsafe.has(segment)) throw Error(`unsafe JSON Pointer segment ${segment}`);
  if (!new Set(["content", "artSets", "terminology", "theme", "assets"]).has(segments[0]!)) throw Error(`unsupported patch root ${segments[0]}`);
  return segments;
}

export function validateFragmentSelection(fragment: GameDescriptorFragment, selection: GameFragmentSelection) {
  const diagnostics: CompositionDiagnostic[] = [], values: Record<string, string | number | boolean> = {};
  for (const key of Object.keys(selection.parameters)) if (!fragment.parameters[key]) diagnostics.push({ code: "parameter", path: `${fragment.id}.parameters.${key}`, message: `unknown parameter ${key}` });
  for (const [key, definition] of Object.entries(fragment.parameters)) {
    const supplied = selection.parameters[key], value = supplied ?? definition.default;
    if (value === undefined) {
      if (definition.required) diagnostics.push({ code: "parameter", path: `${fragment.id}.parameters.${key}`, message: `required parameter ${key} is missing` });
      continue;
    }
    if (typeof value !== definition.type) {
      diagnostics.push({ code: "parameter", path: `${fragment.id}.parameters.${key}`, message: `parameter ${key} must be ${definition.type}` });
      continue;
    }
    if (definition.type === "string" && (definition.options?.length ?? 0) > 0 && !definition.options!.includes(value as string)) diagnostics.push({ code: "parameter", path: `${fragment.id}.parameters.${key}`, message: `parameter ${key} is not an allowed option` });
    if (definition.type === "number" && definition.min !== undefined && (value as number) < definition.min) diagnostics.push({ code: "parameter", path: `${fragment.id}.parameters.${key}`, message: `parameter ${key} is below minimum ${definition.min}` });
    if (definition.type === "number" && definition.max !== undefined && (value as number) > definition.max) diagnostics.push({ code: "parameter", path: `${fragment.id}.parameters.${key}`, message: `parameter ${key} exceeds maximum ${definition.max}` });
    values[key] = value;
  }
  return { diagnostics, values };
}

function parameterize(value: unknown, parameters: Record<string, string | number | boolean>): unknown {
  if (Array.isArray(value)) return value.map(item => parameterize(item, parameters));
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>, keys = Object.keys(record);
    if (keys.length === 1 && keys[0] === "$parameter") {
      const key = record.$parameter;
      if (typeof key !== "string" || parameters[key] === undefined) throw Error(`unresolved parameter ${String(key)}`);
      return parameters[key];
    }
    return Object.fromEntries(Object.entries(record).map(([key, item]) => [key, parameterize(item, parameters)]));
  }
  return value;
}

function target(root: Record<string, any>, segments: string[]) {
  let parent: any = root;
  for (const segment of segments.slice(0, -1)) {
    if (!parent || typeof parent !== "object" || (Array.isArray(parent) && !/^(0|[1-9][0-9]*)$/.test(segment)) || !Object.prototype.hasOwnProperty.call(parent, segment)) throw Error(`patch parent does not exist at ${segment}`);
    parent = parent[segment];
  }
  const key = segments.at(-1)!;
  if (Array.isArray(parent) && (!/^(0|[1-9][0-9]*)$/.test(key) || !Object.prototype.hasOwnProperty.call(parent, key))) throw Error(`patch array index does not exist at ${key}`);
  return { parent, key };
}

export function composeGameDescriptor(input: ComposeGameDescriptorInput): { document: WorldPackDocument; report: CompositionReport } {
  const document = structuredClone(input.base), diagnostics: CompositionDiagnostic[] = [], selected: { id: string; version: string }[] = [], writes = new Map<string, string>(), resolved: { fragment: GameDescriptorFragment; selection: GameFragmentSelection; parameters: Record<string, string | number | boolean> }[] = [];
  const overlappingWrite = (path: string, owner: string) => [...writes.entries()].find(([written, writtenBy]) => writtenBy !== owner && (written === path || written.startsWith(`${path}/`) || path.startsWith(`${written}/`)));
  for (const selection of input.selections) {
    const versions = input.fragments.filter(value => value.id === selection.fragmentId), fragment = versions.find(value => value.version === selection.version);
    if (!versions.length) { diagnostics.push({ code: "fragment", path: selection.fragmentId, message: `unknown fragment ${selection.fragmentId}` }); continue; }
    if (!fragment) { diagnostics.push({ code: "version", path: selection.fragmentId, message: `unknown fragment version ${selection.fragmentId}@${selection.version}` }); continue; }
    const validation = validateFragmentSelection(fragment, selection);
    diagnostics.push(...validation.diagnostics); selected.push({ id: fragment.id, version: fragment.version });
    if (!validation.diagnostics.length) resolved.push({ fragment, selection, parameters: validation.values });
  }
  const capabilities = [...new Set(resolved.flatMap(value => value.fragment.provides))].sort(), fragmentIds = new Set(resolved.map(value => value.fragment.id));
  for (const { fragment } of resolved) {
    for (const required of fragment.requires) if (!capabilities.includes(required)) diagnostics.push({ code: "capability", path: fragment.id, message: `missing required capability ${required}` });
    for (const conflict of fragment.conflicts) if (fragmentIds.has(conflict) || capabilities.includes(conflict)) diagnostics.push({ code: "conflict", path: fragment.id, message: `fragment ${fragment.id} conflicts with ${conflict}` });
  }
  for (const { fragment, parameters } of resolved) for (const [index, patch] of fragment.patches.entries()) {
    let segments: string[];
    try { segments = parseFragmentPointer(patch.path); }
    catch (error) { diagnostics.push({ code: "path", path: `${fragment.id}.patches.${index}`, message: error instanceof Error ? error.message : "invalid patch path" }); continue; }
    try {
      assertSafeFragmentValue(patch.value);
      const destination = target(document as any, segments), value = parameterize(structuredClone(patch.value), parameters), concrete: string[] = [];
      if (patch.op === "set") {
        if (Object.prototype.hasOwnProperty.call(destination.parent, destination.key)) throw Error(`set target already exists at ${patch.path}`);
        concrete.push(patch.path); destination.parent[destination.key] = value;
      } else if (patch.op === "merge") {
        const current = destination.parent[destination.key];
        if (!current || typeof current !== "object" || Array.isArray(current) || !value || typeof value !== "object" || Array.isArray(value)) throw Error(`merge requires objects at ${patch.path}`);
        for (const key of Object.keys(value as Record<string, unknown>)) {
          const path = `${patch.path}/${pointerEscape(key)}`;
          if (Object.prototype.hasOwnProperty.call(current, key) && !overlappingWrite(path, fragment.id)) throw Error(`merge target already exists at ${path}`);
        }
        for (const [key, item] of Object.entries(value as Record<string, unknown>)) { concrete.push(`${patch.path}/${pointerEscape(key)}`); if (!Object.prototype.hasOwnProperty.call(current, key)) current[key] = item; }
      } else {
        const current = destination.parent[destination.key];
        if (!Array.isArray(current) || !Array.isArray(value)) throw Error(`append requires arrays at ${patch.path}`);
        for (const item of value) { concrete.push(`${patch.path}/${current.length}`); current.push(item); }
      }
      for (const path of concrete) {
        const overlap = overlappingWrite(path, fragment.id);
        if (overlap) diagnostics.push({ code: "write-conflict", path, message: `fragments ${overlap[1]} and ${fragment.id} write overlapping paths ${overlap[0]} and ${path}` });
        else writes.set(path, fragment.id);
      }
    } catch (error) { diagnostics.push({ code: "path", path: `${fragment.id}.patches.${index}`, message: error instanceof Error ? error.message : "patch failed" }); }
  }
  const defaultArtSets = [...new Set(resolved.map(value => value.fragment.defaultArtSet).filter((value): value is string => Boolean(value)))];
  if (defaultArtSets.length > 1) diagnostics.push({ code: "conflict", path: "manifest.defaultArtSet", message: `selected fragments request different default Art Sets: ${defaultArtSets.join(", ")}` });
  if (defaultArtSets[0] && !document.artSets[defaultArtSets[0]]) diagnostics.push({ code: "pack", path: "manifest.defaultArtSet", message: `selected default Art Set ${defaultArtSets[0]} is missing` });
  document.manifest = { ...document.manifest, id: `masterhost.game.${input.projectId}`, version: `0.1.${input.revision}`, name: input.name, official: false, publisher: "MasterHost Game Builder", ...(defaultArtSets.length === 1 ? { defaultArtSet: defaultArtSets[0] } : {}) };
  const parsed = WorldPackDocumentSchema.safeParse(document);
  if (!parsed.success) for (const issue of parsed.error.issues) diagnostics.push({ code: "pack", path: issue.path.join("."), message: issue.message });
  const report: CompositionReport = { valid: diagnostics.length === 0, diagnostics, selected, providedCapabilities: capabilities, writes: [...writes.keys()] };
  return { document: structuredClone((parsed.success ? parsed.data : document) as WorldPackDocument), report };
}
