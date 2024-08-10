import { db } from "../db/db";
import { channels } from "../db/schema";
import { eq } from "drizzle-orm";

export interface Channel {
  id: number;
  channelId: bigint;
  name: string;
}

export class ChannelService {
  async getChannels(): Promise<Channel[]> {
    return await db.select().from(channels);
  }

  async addChannel({
    channelId,
    name,
  }: {
    channelId: bigint;
    name: string;
  }): Promise<void> {
    await db.insert(channels).values({ channelId, name });
  }

  async removeChannel(channelId: bigint): Promise<void> {
    await db.delete(channels).where(eq(channels.channelId, channelId));
  }
}
