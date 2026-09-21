import { afterEach, describe, expect, it } from "vitest";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fragmentCatalog, loadFragmentRegistry, validateGameDescriptorFragment } from "@masterhost/descriptor";
import { createStarterPack, toLoadedWorldPack, worldPackDocumentFromLoaded } from "@masterhost/worldpack-sdk";

const temporary: string[] = [];
afterEach(async () => { await Promise.all(temporary.splice(0).map(path => rm(path, { recursive: true, force: true }))); });

const valid = {
  id: "masterhost.fragment.valid",
  version: "1.0.0",
  name: "Valid",
  description: "A valid fragment",
  provides: ["example:valid"],
  requires: [],
  conflicts: [],
  parameters: { label: { type: "string", required: true } },
  patches: [{ op: "set", path: "/content/templates/example.valid", value: { kind: "location", values: { name: { value: { $parameter: "label" } } } } }],
};

describe("M10 fragment registry", () => {
  it("loads built-in fragments in stable display order with preview metadata", async () => {
    const fragments = await loadFragmentRegistry(resolve("game-assets/fragments"));
    expect(fragments.map(value => value.id)).toEqual(["masterhost.fragment.fortune", "masterhost.fragment.observatory"]);
    expect(fragmentCatalog(fragments)[0]).toMatchObject({ version: "1.0.0", parameterCount: expect.any(Number), provides: expect.any(Array) });
    expect(fragmentCatalog(fragments)[0]).not.toHaveProperty("patches");
  });

  it("adapts a filesystem Pack without losing content, art or asset metadata", async () => {
    const root = await mkdtemp(join(tmpdir(), "masterhost-loaded-pack-")); temporary.push(root); await mkdir(join(root, "assets"));
    const bytes = Buffer.from("<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>"); await writeFile(join(root, "assets", "map.svg"), bytes);
    const source = createStarterPack({ realmId: "00000000-0000-4000-a000-000000000010", id: "masterhost.loaded", name: "Loaded" }).document, loaded = toLoadedWorldPack(source);
    loaded.root = root; loaded.assets = ["assets/map.svg"];
    const document = await worldPackDocumentFromLoaded(loaded, { terminology: { world: "Realm", character: "Hero", gameMaster: "Keeper" }, theme: { primary: "#111111", accent: "#222222", background: "#333333" } });
    expect(document.content).toEqual(source.content); expect(document.artSets).toEqual(source.artSets); expect(document.terminology.world).toBe("Realm");
    expect(document.assets["map.svg"]).toMatchObject({ mediaType: "image/svg+xml", size: bytes.length, checksum: expect.stringMatching(/^[a-f0-9]{64}$/) });
  });

  it("rejects duplicate fragment identity and version", async () => {
    const root = await mkdtemp(join(tmpdir(), "masterhost-fragments-")); temporary.push(root);
    await writeFile(join(root, "one.json"), JSON.stringify(valid));
    await writeFile(join(root, "two.json"), JSON.stringify(valid));
    await expect(loadFragmentRegistry(root)).rejects.toThrow("duplicate fragment masterhost.fragment.valid@1.0.0");
  });

  it.each([
    [{ ...valid, id: "invalid id" }, "fragment id"],
    [{ ...valid, parameters: { mode: { type: "object" } } }, "parameter type"],
    [{ ...valid, patches: [{ op: "set", path: "/content/__proto__/polluted", value: true }] }, "unsafe JSON Pointer"],
    [{ ...valid, patches: [{ op: "merge", path: "/content/templates", value: JSON.parse('{"constructor":{"polluted":true}}') }] }, "unsafe patch value key constructor"],
    [{ ...valid, patches: [{ op: "set", path: "/content/templates/example", value: { name: { $parameter: "missing" } } }] }, "unknown parameter reference missing"],
    [{ ...valid, patches: Array.from({ length: 101 }, (_, index) => ({ op: "set", path: `/content/templates/value-${index}`, value: index })) }, "at most 100 patches"],
    [{ ...valid, patches: [{ op: "set", path: "/content/templates/huge", value: "x".repeat(256 * 1024 + 1) }] }, "256 KiB"],
  ])("rejects an invalid registry document", (input, message) => {
    expect(() => validateGameDescriptorFragment(input)).toThrow(message);
  });
});
