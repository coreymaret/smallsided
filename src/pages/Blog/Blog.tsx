// src/pages/Blog.tsx

import { useState, useEffect } from 'react';
import BlogList from '../../components/Blog/BlogList';
import SEO from '../../components/Blog/SEO';
import { getAllPosts } from '../../utils/blogUtils';
import type { BlogPostMetadata } from '../../types/blog';
import './Blog.scss';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostMetadata[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Get all unique tags
  const allTags = Array.from(
    new Set(posts.flatMap(post => post.tags))
  ).sort();

  // Filter posts by selected tag
  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags.includes(selectedTag))
    : posts;

  if (loading) {
    return (
      <div className="blog-page-loading">
        <div className="blog-page-spinner"></div>
        <p>Loading blog posts...</p>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Blog | Your Site Name"
        description="Read our latest articles, tutorials, and insights."
        type="website"
        url="/blog"
      />

      <div className="blog-page">
        <header className="blog-page-header">
          <h1 className="blog-page-title">Blog</h1>
          <p className="blog-page-description">
            Insights, tutorials, and updates from our team
          </p>
        </header>

        {allTags.length > 0 && (
          <div className="blog-page-filters">
            <button
              className={`blog-page-filter ${!selectedTag ? 'active' : ''}`}
              onClick={() => setSelectedTag(null)}
            >
              All Posts
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                className={`blog-page-filter ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <BlogList posts={filteredPosts} />
      </div>
    </>
  );
};

export default Blog;