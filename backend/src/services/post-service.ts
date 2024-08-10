import { db } from "../db/db";
import { posts } from "../db/schema";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Telegraf } from "telegraf";
import env from "../config/env";
import { eq } from "drizzle-orm";
import { savePostAndNotify } from "../db/schema";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { Buffer } from "buffer";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: true,
  tls: false,
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 5000,
    socketTimeout: 5000,
  }),
});

const bot = new Telegraf(env.BOT_TOKEN);

export class PostService {
  async savePostToDatabase({
    telegramId,
    content,
    channelId,
  }: {
    telegramId: bigint;
    content: string;
    channelId: string;
  }): Promise<number> {
    const post = await savePostAndNotify({ telegramId, content, channelId });
    return post.id;
  }

  async updatePostMedia(postId: number, mediaUrl: string): Promise<void> {
    await db.update(posts).set({ mediaUrl }).where(eq(posts.id, postId));
  }

  async getPosts(): Promise<any[]> {
    return db.select().from(posts);
  }

  async uploadMediaToS3(fileId: string): Promise<string> {
    try {
      const fileLink = await bot.telegram.getFileLink(fileId);
      const response = await fetch(fileLink.href);
      const buffer = await response.arrayBuffer();

      const key = `media/${fileId}`;
      const command = new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType:
          response.headers.get("content-type") || "application/octet-stream",
      });

      await s3Client.send(command);

      return `${env.S3_ENDPOINT}/${env.S3_BUCKET_NAME}/${key}`;
    } catch (error) {
      console.error("Error uploading media to S3:", error);
      throw new Error("Failed to upload media to S3");
    }
  }
}
