// src/utils/blogUtils.ts

import type { BlogPostMetadata } from '../types/blog';
import enPostsIndex from '../content/blog/posts.json';
import esPostsIndexRaw from '../content/blog/posts.es.json';

// Static imports — Vite resolves JSON at build time, no await needed.
// Keep posts.es.json present as at minimum an empty array [].
const esPostsIndex: BlogPostMetadata[] = esPostsIndexRaw as BlogPostMetadata[];

/**
 * Merge EN and ES indexes.
 * ES entries override EN entries for the same slug (translated metadata).
 * EN entries with no ES equivalent are included as-is (fallback).
 */
const getMergedPosts = (language: string): BlogPostMetadata[] => {
  if (language !== 'es') return enPostsIndex as BlogPostMetadata[];

  const enPosts = enPostsIndex as BlogPostMetadata[];
  const esMap = new Map(esPostsIndex.map(p => [p.slug, p]));

  return enPosts.map(post => esMap.get(post.slug) ?? post);
};

export const getAllPosts = (language = 'en'): BlogPostMetadata[] => {
  return getMergedPosts(language)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getPostBySlug = async (slug: string, language = 'en') => {
  const posts = getMergedPosts(language);
  const post = posts.find(p => p.slug === slug);

  if (!post) return null;

  const modules = (import.meta as any).glob('../content/blog/*.md', { query: '?raw', import: 'default' });

  // post.fileName already points to the correct file for the current language
  const primaryPath = `../content/blog/${post.fileName}`;

  // Fallback: find the EN version by slug
  const enPost = (enPostsIndex as BlogPostMetadata[]).find(p => p.slug === slug);
  const fallbackPath = enPost ? `../content/blog/${enPost.fileName}` : null;

  const modulePath = modules[primaryPath]
    ? primaryPath
    : fallbackPath && modules[fallbackPath]
    ? fallbackPath
    : null;

  if (!modulePath) {
    console.error('Markdown file not found:', primaryPath);
    console.error('Available modules:', Object.keys(modules));
    return null;
  }

  try {
    const rawContent = await modules[modulePath]();
    const parts = rawContent.split('---');
    const content = parts.length >= 3 ? parts.slice(2).join('---').trim() : rawContent;

    return { ...post, content };
  } catch (error) {
    console.error('Error loading post:', error);
    return null;
  }
};

export const getFeaturedPosts = (language = 'en'): BlogPostMetadata[] => {
  return getAllPosts(language).filter(post => post.featured);
};

export const getPostsByTag = (tag: string, language = 'en'): BlogPostMetadata[] => {
  return getAllPosts(language).filter(post =>
    post.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
  );
};

/**
 * Format a date string using the appropriate locale.
 */
export const formatDate = (dateString: string, language = 'en'): string => {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
  };
  const locale = localeMap[language] ?? 'en-US';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};