import { z } from "zod";
import { config } from "dotenv";
import { parse } from "pg-connection-string";
import process from "process";

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string(),
  BOT_TOKEN: z.string(),
  TELEGRAM_BOT_TOKEN: z.string(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_ENDPOINT: z.string().url(),
  PORT: z.string().default("3200"),
});

const env = envSchema.parse(process.env);

const dbConfig = parse(env.DATABASE_URL);

export default {
  ...env,
  dbConfig,
};
