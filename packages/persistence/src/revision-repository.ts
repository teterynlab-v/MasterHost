import postgres from"postgres";import type{WorldRevision}from"./revisions.js";
export class RevisionRepository{
 private sql;constructor(url:string){this.sql=postgres(url)}
 async append(r:WorldRevision){await this.sql`insert into world_revisions(id,world_id,number,parent_revision,actor,operation,summary,changes,created_at) values(${r.id},${r.worldId},${r.number},${r.parentRevision??null},${r.actor??null},${r.operation},${r.summary??null},${this.sql.json(r.changes as any)},${r.createdAt})`;return r}
 async list(worldId:string){return await this.sql`select id,world_id,number,parent_revision,actor,operation,summary,changes,created_at from world_revisions where world_id=${worldId} order by number asc`}
 async close(){await this.sql.end()}
}
