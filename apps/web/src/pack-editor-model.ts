export type PackCollection = "templates" | "generators" | "traits" | "checks" | "resources" | "effects" | "actions" | "items" | "progression" | "actorTemplates" | "artSets";

const collectionPath = (collection: PackCollection) => collection === "artSets" ? ["artSets"] : ["content", collection];

function at(document: any, path: string[]) {
  return path.reduce((value, key) => value?.[key], document);
}

export function inboundPackReferences(document: any, collection: PackCollection, id: string): string[] {
  const own = [...collectionPath(collection), id].join(".");
  const references: string[] = [];
  const visit = (value: unknown, path: string[]) => {
    const label = path.join(".");
    if (label === own || label.startsWith(`${own}.`)) return;
    if (value === id) references.push(label);
    else if (Array.isArray(value)) value.forEach((entry, index) => visit(entry, [...path, String(index)]));
    else if (value && typeof value === "object") Object.entries(value).forEach(([key, entry]) => {
      const child = [...path, key], childLabel = child.join(".");
      if (key === id && childLabel !== own && !childLabel.startsWith(`${own}.`)) references.push(childLabel);
      visit(entry, child);
    });
  };
  visit(document, []);
  return [...new Set(references)].sort();
}

export function removePackEntry<T>(document: T, collection: PackCollection, id: string): T {
  const path = collectionPath(collection), entries = at(document, path);
  if (!entries || typeof entries !== "object" || !(id in entries)) throw Error(`${collection} entry ${id} does not exist`);
  const references = inboundPackReferences(document, collection, id);
  if (references.length) throw Error(`Cannot remove ${collection} ${id}; referenced by ${references.join(", ")}`);
  const next = structuredClone(document), target = at(next, path);
  delete target[id];
  return next;
}

export function parsePairs(value: string): Record<string, string> {
  return Object.fromEntries(value.split(",").map(entry => entry.trim()).filter(Boolean).map(entry => {
    const [key, ...rest] = entry.split(":");
    return [key!.trim(), rest.join(":").trim()];
  }).filter(([, entry]) => entry));
}

export function formatPairs(value: Record<string, unknown> | undefined): string {
  return Object.entries(value ?? {}).map(([key, entry]) => `${key}:${String(entry)}`).join(", ");
}
