import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-css";

import { Post } from "../types";

import PostItem from "./PostItem";

interface PostListProperties {
  posts: Post[];
}

const PostList: React.FC<PostListProperties> = ({ posts }) => {
  console.log(posts);
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) {
        setColumns(1);
      } else if (window.innerWidth < 1024) {
        setColumns(2);
      } else if (window.innerWidth < 1324) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };

    window.addEventListener("resize", updateColumns);
    updateColumns();

    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  if (!posts || posts.length === 0) {
    return <div>No posts available</div>;
  }

  const sortedPosts = posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <Masonry
        breakpointCols={columns}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
      >
        {sortedPosts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </Masonry>
    </div>
  );
};

export default PostList;
