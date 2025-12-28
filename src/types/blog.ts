// src/types/blog.ts

export interface BlogPost {
  title: string;
  date: string;
  description: string;
  slug: string;
  author: string;
  authorImage?: string;
  tags: string[];
  featured?: boolean;
  content?: string;
}

export interface BlogPostMetadata {
  title: string;
  date: string;
  description: string;
  slug: string;
  author: string;
  authorImage?: string;
  tags: string[];
  featured?: boolean;
  fileName: string;
}