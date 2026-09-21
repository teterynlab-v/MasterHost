import postgres from "postgres";
import { randomUUID } from "node:crypto";
import type { WorldPackProject } from "@masterhost/worldpack-sdk";
import { assertWorldAssetReferences } from "@masterhost/domain";
import type { ImportedMhGame } from "./mhgame.js";
import { assetChecksum, validateWorldImage } from "./world-assets.js";

export interface GamePackageInstall {
  id: string;
  realmId: string;
  packageId: string;
  worldId: string;
  runtimePackProjectId: string;
  editablePackProjectId: string;
  runtimePack: { id: string; version: string };
  installedAt: string;
}

const forkIdentity = (source: string, packageId: string) => ({ id: `${source}.fork.${packageId.slice(0, 8)}`, version: "0.1.0" });

export function prepareMhGameInstall(game: ImportedMhGame, realmId: string) {
  const now = new Date().toISOString(), source = game.runtimePack, editableIdentity = forkIdentity(source.document.manifest.id, game.manifest.packageId);
  const runtimePack: WorldPackProject = { ...structuredClone(source), realmId, status: "published", revision: Math.max(1, source.revision), publishedAt: now, updatedAt: now, lineage: { source: "mhgame", packageId: game.manifest.packageId, sourcePack: { id: source.document.manifest.id, version: source.document.manifest.version } } };
  const editablePack: WorldPackProject = structuredClone(runtimePack);
  editablePack.id = randomUUID(); editablePack.status = "draft"; editablePack.revision = 1; delete editablePack.publishedAt;
  editablePack.document.manifest = { ...editablePack.document.manifest, ...editableIdentity, name: `${editablePack.document.manifest.name} (Editable)`, official: false, publisher: "MasterHost imported game" };
  const world = structuredClone(game.world); world.realmId = realmId;
  return { runtimePack, editablePack, world };
}

export class GamePackageRepository {
  private sql;
  constructor(url: string) { this.sql = postgres(url); }
  async migrate() {
    await this.sql`create table if not exists game_package_imports(id uuid primary key,realm_id uuid not null,package_id uuid not null,world_id uuid not null,runtime_pack_project_id uuid not null,editable_pack_project_id uuid not null,evidence jsonb not null,installed_at timestamptz not null default now(),unique(realm_id,package_id))`;
    await this.sql`create index if not exists game_package_imports_world on game_package_imports(realm_id,world_id)`;
  }
  async install(game: ImportedMhGame, realmId: string): Promise<GamePackageInstall> {
    assertWorldAssetReferences(game.world);
    const prepared = prepareMhGameInstall(game, realmId), id = randomUUID(), installedAt = new Date().toISOString();
    return this.sql.begin(async tx => {
      const realm = (await tx`select id from realms where id=${realmId} for update`)[0];
      if (!realm) throw Object.assign(Error("Realm not found"), { statusCode: 404 });
      const collision = (await tx`select id from world_pack_projects where realm_id=${realmId} and pack_id=${prepared.runtimePack.document.manifest.id} and pack_version=${prepared.runtimePack.document.manifest.version} and status='published'`)[0];
      if (collision) throw Object.assign(Error("Pack ID and version are already installed"), { statusCode: 409 });
      for (const project of [prepared.runtimePack, prepared.editablePack]) await tx`insert into world_pack_projects(id,realm_id,pack_id,pack_version,status,revision,data) values(${project.id},${realmId},${project.document.manifest.id},${project.document.manifest.version},${project.status},${project.revision},${tx.json(project as any)})`;
      for (const [path, ref] of Object.entries(prepared.world.assets ?? {})) {
        const data = game.worldAssets[path];
        if (!data || data.length !== ref.size || assetChecksum(data) !== ref.checksum) throw Error(`Missing or invalid asset ${path}`);
        validateWorldImage(path, ref.mediaType, data);
        await tx`insert into world_asset_blobs(checksum,data) values(${ref.checksum},${Buffer.from(data)}) on conflict(checksum) do nothing`;
      }
      await tx`insert into worlds(id,realm_id,name,revision,data) values(${prepared.world.id},${realmId},${prepared.world.name},${prepared.world.revision},${tx.json(prepared.world as any)})`;
      await tx`insert into world_revisions(id,world_id,revision,reason,data) values(${randomUUID()},${prepared.world.id},${prepared.world.revision},'mhgame-import',${tx.json(prepared.world as any)})`;
      const evidence = { manifest: game.manifest, descriptorProject: game.descriptorProject, gameAssets: game.gameAssets, dependencyLock: game.dependencyLock, attribution: game.attribution };
      await tx`insert into game_package_imports(id,realm_id,package_id,world_id,runtime_pack_project_id,editable_pack_project_id,evidence) values(${id},${realmId},${game.manifest.packageId},${prepared.world.id},${prepared.runtimePack.id},${prepared.editablePack.id},${tx.json(evidence as any)})`;
      await tx`update realms set config=jsonb_set(coalesce(config,'{}'::jsonb),'{activePack}',${tx.json({ id: prepared.runtimePack.document.manifest.id, version: prepared.runtimePack.document.manifest.version } as any)},true),updated_at=now() where id=${realmId}`;
      return { id, realmId, packageId: game.manifest.packageId, worldId: prepared.world.id, runtimePackProjectId: prepared.runtimePack.id, editablePackProjectId: prepared.editablePack.id, runtimePack: { id: prepared.runtimePack.document.manifest.id, version: prepared.runtimePack.document.manifest.version }, installedAt };
    });
  }
  async getByWorld(realmId: string, worldId: string) {
    const row = (await this.sql`select * from game_package_imports where realm_id=${realmId} and world_id=${worldId}`)[0];
    return row ? { id: row.id, realmId: row.realm_id, packageId: row.package_id, worldId: row.world_id, runtimePackProjectId: row.runtime_pack_project_id, editablePackProjectId: row.editable_pack_project_id, evidence: row.evidence, installedAt: new Date(row.installed_at).toISOString() } : null;
  }
  async close() { await this.sql.end(); }
}
