import postgres from "postgres";
import type { CompositionReport, GameFragmentSelection } from "@masterhost/descriptor";
import { toLoadedWorldPack, type LoadedWorldPack, type WorldPackDocument } from "@masterhost/worldpack-sdk";

export interface GameDescriptorProject {
  id: string;
  realmId: string;
  name: string;
  revision: number;
  seed: string;
  basePack: { id: string; version: string };
  selections: GameFragmentSelection[];
  decisions: Record<string, unknown>;
  locks: string[];
  compiled: WorldPackDocument;
  report: CompositionReport;
  createdAt: string;
  updatedAt: string;
}
export type GameDescriptorRevision = GameDescriptorProject;

export class GameDescriptorRepository {
  private sql;
  constructor(url: string) { this.sql = postgres(url); }

  async migrate() {
    await this.sql`create table if not exists game_descriptor_projects(id uuid primary key,realm_id uuid not null,revision int not null,data jsonb not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now())`;
    await this.sql`create index if not exists game_descriptor_projects_realm on game_descriptor_projects(realm_id,updated_at desc)`;
    await this.sql`create table if not exists game_descriptor_revisions(project_id uuid not null,revision int not null,pack_id text not null,pack_version text not null,data jsonb not null,created_at timestamptz not null default now(),primary key(project_id,revision),unique(pack_id,pack_version))`;
  }

  async create(project: GameDescriptorProject) {
    if (project.revision !== 1) throw Object.assign(Error("new game Descriptor project must start at revision 1"), { statusCode: 409 });
    await this.sql.begin(async tx => {
      await tx`insert into game_descriptor_projects(id,realm_id,revision,data) values(${project.id},${project.realmId},${project.revision},${tx.json(project as any)})`;
      await tx`insert into game_descriptor_revisions(project_id,revision,pack_id,pack_version,data) values(${project.id},${project.revision},${project.compiled.manifest.id},${project.compiled.manifest.version},${tx.json(project as any)})`;
    });
    return structuredClone(project);
  }

  async get(id: string) {
    const row = (await this.sql`select data from game_descriptor_projects where id=${id}`)[0];
    return (row?.data ?? null) as GameDescriptorProject | null;
  }

  async list(realmId: string) {
    const rows = await this.sql`select data from game_descriptor_projects where realm_id=${realmId} order by updated_at desc`;
    return rows.map(row => row.data as GameDescriptorProject);
  }

  async save(project: GameDescriptorProject, expectedRevision: number) {
    return this.sql.begin(async tx => {
      const current = (await tx`select realm_id,revision from game_descriptor_projects where id=${project.id} for update`)[0];
      if (!current) throw Object.assign(Error("game Descriptor project not found"), { statusCode: 404 });
      if (String(current.realm_id) !== project.realmId) throw Object.assign(Error("game Descriptor project not found in Realm"), { statusCode: 404 });
      if (Number(current.revision) !== expectedRevision || project.revision !== expectedRevision + 1) throw Object.assign(Error("game Descriptor project revision changed; reload and retry"), { statusCode: 409 });
      await tx`update game_descriptor_projects set revision=${project.revision},data=${tx.json(project as any)},updated_at=now() where id=${project.id}`;
      await tx`insert into game_descriptor_revisions(project_id,revision,pack_id,pack_version,data) values(${project.id},${project.revision},${project.compiled.manifest.id},${project.compiled.manifest.version},${tx.json(project as any)})`;
      return structuredClone(project);
    });
  }

  async revision(projectId: string, revision: number) {
    const row = (await this.sql`select data from game_descriptor_revisions where project_id=${projectId} and revision=${revision}`)[0];
    return (row?.data ?? null) as GameDescriptorRevision | null;
  }

  async resolvePack(packId: string, packVersion: string): Promise<LoadedWorldPack | null> {
    const row = (await this.sql`select data from game_descriptor_revisions where pack_id=${packId} and pack_version=${packVersion}`)[0];
    return row ? toLoadedWorldPack((row.data as GameDescriptorRevision).compiled) : null;
  }

  async resolveDocument(packId: string, packVersion: string): Promise<WorldPackDocument | null> {
    const row = (await this.sql`select data from game_descriptor_revisions where pack_id=${packId} and pack_version=${packVersion}`)[0];
    return row ? structuredClone((row.data as GameDescriptorRevision).compiled) : null;
  }

  async close() { await this.sql.end(); }
}
