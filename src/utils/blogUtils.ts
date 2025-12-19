// src/utils/blogUtils.ts

import matter from 'gray-matter';
import type { BlogPostMetadata } from '../types/blog';

// Import the generated posts index
import postsIndex from '../content/blog/posts.json';

export const getAllPosts = (): BlogPostMetadata[] => {
  return (postsIndex as BlogPostMetadata[])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getPostBySlug = async (slug: string) => {
  console.log('Looking for slug:', slug);
  console.log('Available posts:', postsIndex);
  
  const post = (postsIndex as BlogPostMetadata[]).find(p => p.slug === slug);
  
  if (!post) {
    console.error('Post not found in index');
    return null;
  }

  console.log('Found post:', post);

  try {
    // Try multiple possible paths
    const possiblePaths = [
      `/src/content/blog/${post.fileName}`,
      `../content/blog/${post.fileName}`,
      `/content/blog/${post.fileName}`
    ];

    let rawContent = null;

    for (const path of possiblePaths) {
      try {
        console.log('Trying path:', path);
        const response = await fetch(path);
        if (response.ok) {
          rawContent = await response.text();
          successPath = path;
          console.log('Successfully loaded from:', path);
          break;
        }
      } catch (e) {
        console.log('Failed path:', path);
      }
    }

    if (!rawContent) {
      throw new Error('Could not load markdown file from any path');
    }
    
    // Parse the markdown to separate frontmatter from content
    const { content } = matter(rawContent);
    
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