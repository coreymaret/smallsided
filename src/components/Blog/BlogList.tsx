// src/components/Blog/BlogList.tsx

// Styles
import styles from './BlogList.module.scss';

// React
import { useState } from 'react';
import { Link } from 'react-router-dom';

// Utilities & Types
import { formatDate } from '../../utils/blogUtils';
import type { BlogPostMetadata } from '../../types/blog';

interface BlogListProps {
  posts: BlogPostMetadata[];
}

/**
 * Grid of blog post preview cards.
 * Renders a card for each post with title, meta, tags, and read-more link.
 */
const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query) ||
      post.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No blog posts yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search posts by title, tag, or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredPosts.length === 0 ? (
        <div className={styles.empty}>
          <p>No posts match "{searchQuery}"</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredPosts.map((post) => (
            <article key={post.slug} className={styles.card}>
              <Link to={`/blog/${post.slug}`} className={styles.cardLink}>
                {/* Header with title and optional featured badge */}
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{post.title}</h2>
                  {post.featured && (
                    <span className={styles.badge}>Featured</span>
                  )}
                </div>

                {/* Date and author */}
                <div className={styles.cardMeta}>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span className={styles.separator}>•</span>
                  <span className={styles.author}>{post.author}</span>
                </div>

                {/* Description */}
                <p className={styles.description}>{post.description}</p>

                {/* Tags */}
            {post.tags.length > 0 && (
              <div className={styles.tags}>
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
                {post.tags.length > 3 && (
                  <span className={styles.tagMore}>+{post.tags.length - 3} more</span>
                )}
              </div>
            )}

                <span className={styles.readMore}>Read more →</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
};

export default BlogList;