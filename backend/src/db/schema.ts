import { InferModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { projects, posts, channels } from "./schema/index";
import { broadcastNewPost } from "../server";
import { db } from "./db";

export type Project = InferModel<typeof projects>;
export type NewProject = InferModel<typeof projects, "insert"> & {
  mediaUrl?: string;
};
export type Post = InferModel<typeof posts>;
export type NewPost = InferModel<typeof posts, "insert">;
export type Channel = InferModel<typeof channels>;
export type NewChannel = InferModel<typeof channels, "insert">;

export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);
export const insertPostSchema = createInsertSchema(posts);
export const selectPostSchema = createSelectSchema(posts);
export const insertChannelSchema = createInsertSchema(channels);
export const selectChannelSchema = createSelectSchema(channels);

export async function savePostAndNotify(postData: NewPost) {
  const [post] = await db.insert(posts).values(postData).returning();
  broadcastNewPost(post);
  return post;
}

export { projects, posts, channels };
