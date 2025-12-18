// src/components/blog/BlogList.tsx

import { Link } from 'react-router-dom';
import type { BlogPostMetadata } from '../../types/blog';
import { formatDate } from '../../utils/blogUtils';
import './BlogList.scss';

interface BlogListProps {
  posts: BlogPostMetadata[];
}

const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <div className="blog-list-empty">
        <p>No blog posts yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="blog-list">
      {posts.map((post) => (
        <article key={post.slug} className="blog-card">
          <Link to={`/blog/${post.slug}`} className="blog-card-link">
            <div className="blog-card-header">
              <h2 className="blog-card-title">{post.title}</h2>
              {post.featured && (
                <span className="blog-card-badge">Featured</span>
              )}
            </div>
            
            <div className="blog-card-meta">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span className="blog-card-separator">•</span>
              <span className="blog-card-author">{post.author}</span>
            </div>

            <p className="blog-card-description">{post.description}</p>

            {post.tags.length > 0 && (
              <div className="blog-card-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="blog-card-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <span className="blog-card-read-more">
              Read more →
            </span>
          </Link>
        </article>
      ))}
    </div>
  );
};

export default BlogList;