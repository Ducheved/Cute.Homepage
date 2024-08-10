import { ReactNode } from "react";

export interface Project {
  [x: string]: string | number | Date;
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  tags: string[];
  link: string;
  stack: ReactNode[];
}

export interface Month {
  month: string;
  items: Project[];
}

export interface ProjectGroup {
  date: string | number | Date;
  year: string;
  months: Month[];
}

export interface Post {
  date: string | number | Date;
  id: string;
  title?: string;
  content: string;
  mediaUrl?: string;
  channelName: string;
  createdAt: string;
}

interface PostsMessage {
  type: "posts" | "initialData";
  data: Post[];
}

interface NewPostMessage {
  type: "newPost";
  data: Post;
}

interface UnknownMessage {
  type: string;
  data?: unknown;
}

export type WebSocketMessage = PostsMessage | NewPostMessage | UnknownMessage;

interface BaseProject {
  stack: string[];
  title: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  link: string;
  tags: string[];
}

interface BaseMonth {
  month: string;
  items: BaseProject[];
}

export interface BaseProjectGroup {
  year: string;
  months: BaseMonth[];
}

interface FormattedProject extends Omit<BaseProject, "stack"> {
  stack: JSX.Element[];
}

interface FormattedMonth extends Omit<BaseMonth, "items"> {
  items: FormattedProject[];
}

export interface FormattedProjectGroup
  extends Omit<BaseProjectGroup, "months"> {
  months: FormattedMonth[];
}

export type IconMap = {
  [key: string]: JSX.Element;
};

/// <reference types="vite/client" />
