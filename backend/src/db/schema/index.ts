import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  bigint,
  jsonb,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "bigint" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  description: text("description").notNull(),
  fullDescription: text("full_description").notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  tags: jsonb("tags").notNull(),
  link: varchar("link", { length: 255 }).notNull(),
  stack: jsonb("stack").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "bigint" }).notNull(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  channelId: text("channel_id").notNull(),
});

export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  channelId: bigint("telegram_id", { mode: "bigint" }).notNull(),
  name: text("name").notNull(),
});
