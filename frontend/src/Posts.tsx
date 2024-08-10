import React, { useState, useEffect } from "react";

import env from "./env";
import { Post } from "./types";

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const socket = new WebSocket(env.VITE_WS_URL);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "getPosts" }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "posts") {
        setPosts(data.data);
      } else if (data.type === "initialData") {
        setPosts(data.posts);
      } else if (data.type === "newPost") {
        setPosts((prevPosts) => [data.data, ...prevPosts]);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {};

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-blue-300 mb-8">Tracked Posts</h1>
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-blue-300 mb-2">
              {post.title}
            </h2>
            <p className="text-gray-300 mb-4">{post.content}</p>
            {post.mediaUrl && (
              <img
                src={post.mediaUrl}
                alt="Post media"
                className="w-full h-auto rounded-lg mb-4"
              />
            )}
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Channel: {post.channelName}</span>
              <span>Posted: {new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;
