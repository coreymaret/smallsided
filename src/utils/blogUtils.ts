// src/utils/blogUtils.ts

import type { BlogPostMetadata } from '../types/blog';

// Import the generated posts index
import postsIndex from '../content/blog/posts.json';

export const getAllPosts = (): BlogPostMetadata[] => {
  return (postsIndex as BlogPostMetadata[])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getPostBySlug = async (slug: string) => {
  const post = (postsIndex as BlogPostMetadata[]).find(p => p.slug === slug);
  
  if (!post) {
    return null;
  }

  try {
    // Import markdown files directly - Vite will handle this at build time
    const modules = import.meta.glob('../content/blog/*.md', { as: 'raw' });
    const path = `../content/blog/${post.fileName}`;
    
    if (!modules[path]) {
      console.error('Markdown file not found:', path);
      console.error('Available modules:', Object.keys(modules));
      return null;
    }

    // Load the raw markdown content
    const rawContent = await modules[path]();
    
    // Extract content after frontmatter (simple approach)
    // Split by --- and take everything after the second ---
    const parts = rawContent.split('---');
    const content = parts.length >= 3 ? parts.slice(2).join('---').trim() : rawContent;
    
    return {
      ...post,
      content: content
    };
  } catch (error) {
    console.error('Error loading post:', error);
    return null;
  }
};

export const getFeaturedPosts = (): BlogPostMetadata[] => {
  return getAllPosts().filter(post => post.featured);
};

export const getPostsByTag = (tag: string): BlogPostMetadata[] => {
  return getAllPosts().filter(post => 
    post.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
  );
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};