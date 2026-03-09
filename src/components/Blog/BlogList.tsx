// src/components/Blog/BlogList.tsx

import styles from './BlogList.module.scss';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/blogUtils';
import type { BlogPostMetadata } from '../../types/blog';

interface BlogListProps {
  posts: BlogPostMetadata[];
  language?: string;
}

const BlogList: React.FC<BlogListProps> = ({ posts, language = 'en' }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Build the correct post URL based on language
  const getPostUrl = (slug: string) =>
    language === 'es' ? `/es/blog/${slug}` : `/blog/${slug}`;

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
        <p>{t('blog.noPosts')}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('blog.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredPosts.length === 0 ? (
        <div className={styles.empty}>
          <p>{t('blog.noResults', { query: searchQuery })}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredPosts.map((post) => (
            <article key={post.slug} className={styles.card}>
              <Link to={getPostUrl(post.slug)} className={styles.cardLink}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{post.title}</h2>
                  {post.featured && (
                    <span className={styles.badge}>{t('blog.featured')}</span>
                  )}
                </div>

                <div className={styles.cardMeta}>
                  <time dateTime={post.date}>{formatDate(post.date, language)}</time>
                  <span className={styles.separator}>•</span>
                  <span className={styles.author}>{post.author}</span>
                </div>

                <p className={styles.description}>{post.description}</p>

                {post.tags.length > 0 && (
                  <div className={styles.tags}>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className={styles.tagMore}>+{post.tags.length - 3} {t('blog.moreTags')}</span>
                    )}
                  </div>
                )}

                <span className={styles.readMore}>{t('blog.readMore')}</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
};

export default BlogList;