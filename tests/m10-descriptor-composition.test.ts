import { describe, expect, it } from "vitest";
import { createStarterPack } from "@masterhost/worldpack-sdk";
import { composeGameDescriptor, type GameDescriptorFragment, type GameFragmentSelection } from "@masterhost/descriptor";

const base = () => createStarterPack({
  realmId: "00000000-0000-4000-a000-000000000010",
  id: "masterhost.m10-base",
  name: "M10 Base",
}).document;

const location: GameDescriptorFragment = {
  id: "masterhost.fragment.observatory",
  version: "1.0.0",
  name: "Ancient Observatory",
  provides: ["location:observatory"],
  requires: [],
  conflicts: [],
  parameters: { danger: { type: "number", required: true, min: 1, max: 5 } },
  patches: [
    { op: "set", path: "/content/templates/location.observatory", value: { kind: "location", values: { name: { value: "Ancient Observatory" }, danger: { value: { $parameter: "danger" } } } } },
    { op: "merge", path: "/content/templates/world.root/components", value: { observatory: { template: "location.observatory" } } },
  ],
};

const compose = (fragments: GameDescriptorFragment[], selections: GameFragmentSelection[] = fragments.map(fragment => {
  const parameters: Record<string, string | number | boolean> = fragment === location ? { danger: 4 } : {};
  return { fragmentId: fragment.id, version: fragment.version, parameters };
})) => composeGameDescriptor({
  projectId: "game-one",
  revision: 3,
  name: "Game One",
  base: base(),
  fragments,
  selections,
});

describe("M10 dynamic game Descriptor composition", () => {
  it("composes the same Pack from the same ordered selections", () => {
    const first = compose([location]);
    const second = compose([location]);
    expect(first.report.valid).toBe(true);
    expect(first.document).toEqual(second.document);
    expect(first.document.content.templates["location.observatory"].values?.danger).toEqual({ value: 4 });
    expect(first.document.manifest).toMatchObject({ id: "masterhost.game.game-one", version: "0.1.3", name: "Game One", official: false, publisher: "MasterHost Game Builder" });
  });

  it("reports missing capabilities and explicit conflicts", () => {
    const dependent: GameDescriptorFragment = { id: "dependent", version: "1", name: "Dependent", provides: [], requires: ["rules:missing"], conflicts: [], parameters: {}, patches: [] };
    const blocked: GameDescriptorFragment = { id: "blocked", version: "1", name: "Blocked", provides: ["rules:blocked"], requires: [], conflicts: [location.id], parameters: {}, patches: [] };
    const result = compose([location, dependent, blocked]);
    expect(result.report.diagnostics.map(value => value.code)).toEqual(expect.arrayContaining(["capability", "conflict"]));
    expect(result.report.valid).toBe(false);
  });

  it("rejects overlapping concrete writes", () => {
    const overlap: GameDescriptorFragment = { id: "overlap", version: "1", name: "Overlap", provides: [], requires: [], conflicts: [], parameters: {}, patches: [{ op: "merge", path: "/content/templates/world.root/components", value: { observatory: { template: "place.standard" } } }] };
    const result = compose([location, overlap]);
    expect(result.report.diagnostics).toContainEqual(expect.objectContaining({ code: "write-conflict", path: "/content/templates/world.root/components/observatory" }));
  });

  it.each([
    ["missing", {}, "required"],
    ["wrong type", { danger: "high" }, "number"],
    ["unknown", { danger: 4, surprise: true }, "unknown"],
    ["below minimum", { danger: 0 }, "minimum"],
  ])("rejects %s parameters", (_label, parameters, message) => {
    const result = compose([location], [{ fragmentId: location.id, version: location.version, parameters: parameters as any }]);
    expect(result.report.diagnostics).toContainEqual(expect.objectContaining({ code: "parameter", message: expect.stringContaining(message) }));
  });

  it.each(["__proto__", "prototype", "constructor"])("rejects unsafe pointer segment %s", segment => {
    const hostile: GameDescriptorFragment = { id: `hostile-${segment}`, version: "1", name: "Hostile", provides: [], requires: [], conflicts: [], parameters: {}, patches: [{ op: "set", path: `/content/${segment}/polluted`, value: true }] };
    const result = compose([hostile]);
    expect(result.report.diagnostics).toContainEqual(expect.objectContaining({ code: "path", message: expect.stringContaining(segment) }));
    expect(({} as any).polluted).toBeUndefined();
  });

  it("preserves dotted IDs as one JSON Pointer segment", () => {
    expect(compose([location]).report.writes).toContain("/content/templates/location.observatory");
  });

  it("does not mutate base documents or fragments", () => {
    const source = base(), sourceCopy = structuredClone(source), fragmentCopy = structuredClone(location);
    composeGameDescriptor({ projectId: "immutable", revision: 1, name: "Immutable", base: source, fragments: [location], selections: [{ fragmentId: location.id, version: location.version, parameters: { danger: 2 } }] });
    expect(source).toEqual(sourceCopy);
    expect(location).toEqual(fragmentCopy);
  });
});
