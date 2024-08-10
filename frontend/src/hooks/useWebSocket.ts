import { useState, useEffect } from "react";

import { Post, WebSocketMessage } from "../types";

export const useWebSocket = (url: string) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "getPosts" }));
    };

    socket.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        handleWebSocketMessage(data, setPosts);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {};

    return () => {
      socket.close();
    };
  }, [url]);

  return posts;
};

const handleWebSocketMessage = (
  message: WebSocketMessage,
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>,
) => {
  switch (message.type) {
    case "posts":
    case "initialData":
      setPosts(message.data as Post[]);
      break;
    case "newPost":
      setPosts((prevPosts) => [...prevPosts, message.data as Post]);
      break;
    default:
      console.warn("Unknown message type:", message.type);
  }
};
