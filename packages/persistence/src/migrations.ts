import postgres from"postgres";
export async function migrateV02(url:string){const sql=postgres(url);
 await sql`create table if not exists world_revisions(id uuid primary key,world_id uuid not null,number int not null,parent_revision uuid null,actor text null,operation text not null,summary text null,changes jsonb not null default '{}'::jsonb,created_at timestamptz not null default now())`;
 await sql`create unique index if not exists world_revisions_world_number on world_revisions(world_id,number)`;
 await sql`create table if not exists world_relations(id text primary key,world_id uuid not null,from_entity uuid not null,relation_type text not null,to_entity uuid not null,source text not null,source_ref text null)`;
 await sql`create index if not exists world_relations_world on world_relations(world_id)`;
 await sql.end();
}
