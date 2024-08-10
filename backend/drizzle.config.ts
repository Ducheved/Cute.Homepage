import { defineConfig } from "drizzle-kit";
import env from "./src/config/env";

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: env.dbConfig.host ?? "192.168.31.15",
    port: env.dbConfig.port ? parseInt(env.dbConfig.port) : undefined,
    user: env.dbConfig.user,
    password: env.dbConfig.password,
    database: env.dbConfig.database ?? "default_db",
    ssl: false,
  },
  verbose: true,
  strict: true,
});
