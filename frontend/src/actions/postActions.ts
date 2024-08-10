import { Dispatch, SetStateAction } from "react";

import { Post } from "../types";

type WebSocketMessage =
  | { type: "posts" | "initialData"; data: Post[] }
  | { type: "newPost"; data: Post }
  | { type: "error"; message: string }
  | { type: string; data?: unknown };

export const connectWebSocket = (
  setPosts: Dispatch<SetStateAction<Post[]>>,
) => {
  const socket = new WebSocket("ws://localhost:3200/ws");

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: "getPosts" }));
  };

  socket.onmessage = (event) => {
    const data: WebSocketMessage = JSON.parse(event.data);
    handleWebSocketMessage(data, setPosts);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {};

  return () => {
    socket.close();
  };
};

const handleWebSocketMessage = (
  data: WebSocketMessage,
  setPosts: Dispatch<SetStateAction<Post[]>>,
) => {
  switch (data.type) {
    case "posts":
    case "initialData":
      setPosts(data.data as Post[]);
      break;
    case "newPost":
      setPosts((prevPosts) => [data.data as Post, ...prevPosts]);
      break;
    case "error":
      console.error(
        "WebSocket error message:",
        (data as { type: "error"; message: string }).message,
      );
      break;
    default:
      console.warn("Unknown message type:", data.type);
  }
};
