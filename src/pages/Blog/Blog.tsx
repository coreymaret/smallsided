// src/pages/Blog/Blog.tsx

import styles from './Blog.module.scss';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import SEO from '../../components/SEO/SEO';
import { getSEOConfig } from '../../config/seo';
import { FileText } from '../../components/Icons/Icons';
import BlogList from '../../components/Blog/BlogList';
import { getAllPosts } from '../../utils/blogUtils';
import type { BlogPostMetadata } from '../../types/blog';

const Blog: React.FC = () => {
  const seo = getSEOConfig('blog');
  const { t } = useTranslation();
  const { isSpanish } = useLanguage();
  const language = isSpanish ? 'es' : 'en';

  const [posts, setPosts] = useState<BlogPostMetadata[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const postsPerPage = 6;

  useEffect(() => {
    try {
      const allPosts = getAllPosts(language);
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [language]);

  const allTags = Array.from(
    new Set(posts.flatMap(post => post.tags))
  ).sort();

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags.includes(selectedTag))
    : posts;

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>{t('blog.loading')}</p>
      </div>
    );
  }

  return (
    <>
      <SEO {...seo} />

      <div className={styles.blogPage}>
        <div className={styles.blogHero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <FileText size={48} />
            </div>
            <h1>{t('blog.heading')}</h1>
            <p className={styles.heroSubtitle}>{t('blog.subtitle')}</p>
            <p className={styles.heroDescription}>{t('blog.description')}</p>
          </div>
        </div>

        <div className={styles.blogContent}>
          {allTags.length > 0 && (
            <div className={styles.filters}>
              <button
                className={`${styles.filter} ${!selectedTag ? styles.active : ''}`}
                onClick={() => { setSelectedTag(null); setCurrentPage(1); }}
              >
                {t('blog.allPosts')}
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
                  {filtersExpanded ? t('blog.showLess') : t('blog.showMore', { count: allTags.length - 3 })}
                </button>
              )}
            </div>
          )}

          <BlogList posts={paginatedPosts} language={language} />

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Blog pagination">
              <button
                className={`${styles.pageBtn} ${styles.pageNav}`}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← {t('register.pagination.previous')}
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
                {t('register.pagination.next')} →
              </button>
            </nav>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;