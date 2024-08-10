import React from "react";

import PostList from "../components/PostList";
import { useWebSocket } from "../hooks/useWebSocket";

const Posts: React.FC = () => {
  const posts = useWebSocket("ws://localhost:3200/ws");

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-12 text-4xl font-bold text-indigo-300 text-center">
        Tracked Posts
      </h1>
      <div className="relative">
        <PostList posts={posts} />
      </div>
    </div>
  );
};

export default Posts;
