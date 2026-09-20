import postgres from "postgres";

export async function withMigrationLock<T>(url: string, migrate: () => Promise<T>): Promise<T> {
  const sql = postgres(url, { max: 1 });
  try {
    await sql`select pg_advisory_lock(7649021123456)`;
    try {
      return await migrate();
    } finally {
      await sql`select pg_advisory_unlock(7649021123456)`;
    }
  } finally {
    await sql.end();
  }
}
