import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import env from "../config/env";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { Buffer } from "buffer";
import { Telegraf } from "telegraf";
import { MyContext } from "../bot/types";
import sharp from "sharp";

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

async function applyWatermark(
  buffer: Buffer,
  watermarkText: string,
): Promise<Buffer> {
  return await sharp(buffer)
    .composite([
      {
        input: Buffer.from(
          `<svg>
          <text x="10" y="50" font-size="50" fill="white" stroke="black" stroke-width="1">${watermarkText}</text>
        </svg>`,
        ),
        gravity: "southeast",
      },
    ])
    .toBuffer();
}

async function compressImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer).webp({ quality: 80 }).toBuffer();
}

export async function uploadMediaToS3(
  fileId: string,
  bot: Telegraf<MyContext>,
  applyWatermarkFlag?: boolean,
  watermarkText: string = "Ducheved Made it",
): Promise<string> {
  try {
    const fileLink = await bot.telegram.getFileLink(fileId);
    const response = await fetch(fileLink.href);
    let buffer = await response.arrayBuffer();

    if (applyWatermarkFlag) {
      buffer = await applyWatermark(Buffer.from(buffer), watermarkText);
    }

    buffer = await compressImage(Buffer.from(buffer));

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
