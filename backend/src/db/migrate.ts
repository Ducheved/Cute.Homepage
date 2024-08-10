import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import path from "path";
import env from "../config/env";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function runMigrations() {
  const migrationsFolder = path.resolve(__dirname, "../drizzle");
  await migrate(db, { migrationsFolder });
  await pool.end();
}

runMigrations().catch(console.error);
