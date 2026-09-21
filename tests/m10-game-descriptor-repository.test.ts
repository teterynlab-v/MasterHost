import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { createStarterPack } from "@masterhost/worldpack-sdk";
import { composeGameDescriptor, type GameDescriptorFragment } from "@masterhost/descriptor";
import { GameDescriptorRepository, type GameDescriptorProject } from "@masterhost/persistence";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;
const realmA = "00000000-0000-4000-a000-000000000010";
const realmB = "00000000-0000-4000-a000-000000000011";
const fragment: GameDescriptorFragment = { id: "fragment.persistence", version: "1", name: "Persistence", provides: ["test:persistence"], requires: [], conflicts: [], parameters: {}, patches: [{ op: "set", path: "/content/templates/persisted", value: { kind: "location", values: { name: { value: "Persisted" } } } }] };

suite("M10 GameDescriptorRepository", () => {
  let repository: GameDescriptorRepository;
  const id = randomUUID(), now = new Date().toISOString();
  const projectAtRevision = (revision: number, realmId = realmA): GameDescriptorProject => {
    const base = createStarterPack({ realmId, id: "masterhost.repository-base", name: "Repository Base" }).document;
    const selections = [{ fragmentId: fragment.id, version: fragment.version, parameters: {} }], composed = composeGameDescriptor({ projectId: id, revision, name: "Repository Game", base, fragments: [fragment], selections });
    return { id, realmId, name: "Repository Game", revision, seed: "repository-seed", basePack: { id: base.manifest.id, version: base.manifest.version }, selections, decisions: { "world.tone": "hopeful" }, locks: ["world.tone"], compiled: composed.document, report: composed.report, createdAt: now, updatedAt: new Date().toISOString() };
  };

  beforeAll(async () => { repository = new GameDescriptorRepository(databaseUrl!); await repository.migrate(); });
  afterAll(async () => { if (repository) await repository.close(); });

  it("persists current state with Realm isolation and immutable composed revisions", async () => {
    const created = await repository.create(projectAtRevision(1));
    expect(await repository.get(id)).toEqual(created);
    expect((await repository.list(realmA)).map(value => value.id)).toContain(id);
    expect((await repository.list(realmB)).map(value => value.id)).not.toContain(id);

    const updated = await repository.save(projectAtRevision(2), 1);
    await expect(repository.save(projectAtRevision(3), 1)).rejects.toMatchObject({ statusCode: 409 });
    expect((await repository.revision(id, 1))?.compiled.manifest.version).toBe("0.1.1");
    expect((await repository.revision(id, 2))?.compiled.manifest.version).toBe("0.1.2");
    expect((await repository.resolvePack(created.compiled.manifest.id, created.compiled.manifest.version))?.manifest.version).toBe("0.1.1");
    expect((await repository.resolvePack(updated.compiled.manifest.id, updated.compiled.manifest.version))?.manifest.version).toBe("0.1.2");
  });
});
