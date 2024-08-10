import React, { useState, useRef, useEffect } from "react";

import { Post } from "../types";

interface PostItemProps {
  post: Post;
}

const extractHashtags = (text: string): string[] => {
  const regex = /#(\w+)/g;
  const matches = text.match(regex);
  return matches ? matches : [];
};

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState("auto");
  const contentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(contentRef.current).lineHeight,
      );
      setHeight(`${lineHeight * 3}px`);
    }
  }, []);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setHeight(isExpanded ? `${contentRef.current?.scrollHeight}px` : "auto");
  };

  const hashtags = extractHashtags(post.content);

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-accent-purple bg-dark-200 p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
      <h2 className="mb-2 text-xl font-semibold text-accent-blue">
        {post.title}
      </h2>
      <p
        ref={contentRef}
        className="mb-4 text-gray-300 overflow-hidden transition-all duration-300"
        style={{ height: isExpanded ? "auto" : height }}
      >
        {post.content}
      </p>
      {!isExpanded && (
        <button
          onClick={toggleExpand}
          className="text-accent-purple hover:text-accent-blue transition-colors duration-200"
        >
          Read more
        </button>
      )}
      {post.mediaUrl && (
        <img
          src={post.mediaUrl}
          alt="Post media"
          className="mb-4 w-full rounded-lg object-cover"
          style={{ aspectRatio: "16 / 9" }}
        />
      )}
      <div className="flex flex-wrap items-center justify-start text-sm text-gray-400 gap-2">
        {hashtags.length > 0 ? (
          hashtags.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-accent-purple bg-opacity-20 px-3 py-1 text-xs font-semibold shadow-sm"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-accent-blue bg-opacity-20 px-3 py-1 text-xs font-semibold shadow-sm">
            {post.channelName}
          </span>
        )}
      </div>
    </div>
  );
};
export default PostItem;
