import Fastify from "fastify";
import websocketPlugin from "@fastify/websocket";
import { RawData, WebSocket } from "ws";
import { bot } from "./bot/telegram-bot";
import env from "./config/env";
import { serializeBigInt } from "./utils/bigint-serializer";
import { Project, projects } from "./db/schema";
import { db } from "./db/db";
import fastifyCors from "@fastify/cors";
import process from "process";
import { PostService } from "./services/post-service";

const fastify = Fastify();
const postService = new PostService();

fastify.register(websocketPlugin, {
  options: { maxPayload: 1048576 },
});

fastify.register(fastifyCors, {
  origin: "http://localhost:5173",
});

const connections = new Set<WebSocket>();

function broadcast(message: any): void {
  connections.forEach((connection) => {
    if (connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
    }
  });
}

fastify.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, (connection, _req) => {
    connections.add(connection);

    connection.on("message", async (message: RawData) => {
      const { type } = JSON.parse(message.toString());

      if (type === "getPosts") {
        const posts = await postService.getPosts();
        connection.send(
          JSON.stringify({ type: "posts", data: serializeBigInt(posts) }),
        );
      }
    });

    const sendInitialData = async () => {
      const posts = await postService.getPosts();
      connection.send(
        JSON.stringify({
          type: "initialData",
          posts: serializeBigInt(posts),
        }),
      );
    };

    sendInitialData();

    connection.on("close", () => {
      connections.delete(connection);
    });
  });
});

fastify.get("/api/projects", async (request, reply) => {
  try {
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(projects.createdAt);

    const groupedProjects = allProjects.reduce(
      (acc: Record<string, Record<string, any[]>>, project: Project) => {
        const date = new Date(project.createdAt);
        const year = date.getFullYear().toString();
        const month = date.toLocaleString("default", { month: "short" });

        if (!acc[year]) {
          acc[year] = {};
        }
        if (!acc[year][month]) {
          acc[year][month] = [];
        }
        acc[year][month].push({
          title: project.title,
          description: project.description,
          fullDescription: project.fullDescription,
          imageUrl: project.imageUrl,
          tags: project.tags,
          link: project.link,
          stack: project.stack,
        });

        return acc;
      },
      {},
    );

    const formattedProjects = Object.entries(groupedProjects).map(
      ([year, months]) => ({
        year,
        months: Object.entries(months as Record<string, any[]>).map(
          ([month, items]) => ({
            month,
            items,
          }),
        ),
      }),
    );

    reply.send(formattedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    reply.status(500).send({ error: "Internal Server Error" });
  }
});

fastify.setNotFoundHandler((request, reply) => {
  reply.status(304).send();
});

export function broadcastNewPost(post: any): void {
  broadcast({ type: "newPost", data: serializeBigInt(post) });
}

const start = async () => {
  try {
    await fastify.listen({ port: parseInt(env.PORT), host: "0.0.0.0" });
    await bot.launch();
  } catch (err) {
    fastify.log.error(err);
    if (typeof process !== "undefined") {
      process.exit(1);
    } else {
      console.error("process is not defined");
    }
  }
};

start();
