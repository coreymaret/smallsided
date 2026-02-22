// src/pages/Blog/Blog.tsx

// Styles
import styles from './Blog.module.scss';

// React
import { useState, useEffect } from 'react';

// SEO
import SEO from '../../components/SEO/SEO';
import { getSEOConfig } from '../../config/seo';

// Icons
import { FileText } from '../../components/Icons/Icons';

// Components
import BlogList from '../../components/Blog/BlogList';

// Utilities & Types
import { getAllPosts } from '../../utils/blogUtils';
import type { BlogPostMetadata } from '../../types/blog';

/**
 * Blog listing page with tag-based filtering,
 * expandable tag pills, and pagination.
 */
const Blog: React.FC = () => {
  const seo = getSEOConfig('blog');

  const [posts, setPosts] = useState<BlogPostMetadata[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const postsPerPage = 6;

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

  /** Pagination */
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

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
        {/* Hero banner */}
        <div className={styles.blogHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <FileText size={48} />
            </div>
            <h1>Blog</h1>
            <p className={styles.heroSubtitle}>News & Insights</p>
            <p className={styles.heroDescription}>
              Insights, tutorials, and updates from our team
            </p>
          </div>
        </div>

        {/* Content area */}
        <div className={styles.blogContent}>
          {/* Tag filter buttons */}
          {allTags.length > 0 && (
            <div className={styles.filters}>
              <button
                className={`${styles.filter} ${!selectedTag ? styles.active : ''}`}
                onClick={() => { setSelectedTag(null); setCurrentPage(1); }}
              >
                All Posts
              </button>
              {(filtersExpanded ? allTags : allTags.slice(0, 3)).map(tag => (
                <button
                  key={tag}
                  className={`${styles.filter} ${selectedTag === tag ? styles.active : ''}`}
                  onClick={() => { setSelectedTag(tag); setCurrentPage(1); }}
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
          <BlogList posts={paginatedPosts} />

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Blog pagination">
              <button
                className={`${styles.pageBtn} ${styles.pageNav}`}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`${styles.pageBtn} ${page === currentPage ? styles.pageActive : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className={`${styles.pageBtn} ${styles.pageNav}`}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </nav>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;