// src/pages/Blog/Blog.tsx

// Styles
import styles from './Blog.module.scss';

// React
import { useState, useEffect } from 'react';

// SEO
import SEO from '../../components/SEO/SEO';
import { getSEOConfig } from '../../config/seo';

// Components
import BlogList from '../../components/Blog/BlogList';

// Utilities & Types
import { getAllPosts } from '../../utils/blogUtils';
import type { BlogPostMetadata } from '../../types/blog';

/**
 * Blog listing page with tag-based filtering.
 * Loads all posts on mount, extracts unique tags,
 * and lets users filter by topic.
 */
const Blog: React.FC = () => {
  const seo = getSEOConfig('blog');

  const [posts, setPosts] = useState<BlogPostMetadata[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /** Fetch all blog posts on mount */
  useEffect(() => {
    try {
      const allPosts = getAllPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Unique sorted tags derived from all posts */
  const allTags = Array.from(
    new Set(posts.flatMap(post => post.tags))
  ).sort();

  /** Posts filtered by the currently selected tag */
  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags.includes(selectedTag))
    : posts;

  /* Loading state */
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading blog posts...</p>
      </div>
    );
  }

  return (
    <>
      {/* SEO meta tags, OG, Twitter, JSON-LD */}
      <SEO {...seo} />

      <div className={styles.blogPage}>
        {/* Page header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Blog</h1>
          <p className={styles.description}>
            Insights, tutorials, and updates from our team
          </p>
        </header>

        {/* Tag filter buttons */}
        {allTags.length > 0 && (
          <div className={styles.filters}>
            <button
              className={`${styles.filter} ${!selectedTag ? styles.active : ''}`}
              onClick={() => setSelectedTag(null)}
            >
              All Posts
            </button>
            {(filtersExpanded ? allTags : allTags.slice(0, 3)).map(tag => (
              <button
                key={tag}
                className={`${styles.filter} ${selectedTag === tag ? styles.active : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
            {allTags.length > 3 && (
              <button
                className={styles.filterToggle}
                onClick={() => setFiltersExpanded(!filtersExpanded)}
              >
                {filtersExpanded ? 'Show less' : `+${allTags.length - 3} more`}
              </button>
            )}
          </div>
        )}

        {/* Filtered post grid */}
        <BlogList posts={filteredPosts} />
      </div>
    </>
  );
};

export default Blog;