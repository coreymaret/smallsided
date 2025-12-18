// src/components/blog/BlogPost.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import { getPostBySlug } from '../../utils/blogUtils';
import type { BlogPost as BlogPostType } from '../../types/blog';
import SEO from '../Blog/SEO';
import './BlogPost.scss';
import { formatDate } from '../../utils/blogUtils';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const postData = await getPostBySlug(slug);
        if (postData) {
          setPost(postData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading post:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="blog-post-loading">
        <div className="blog-post-spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post-error">
        <h1>Post Not Found</h1>
        <p>The blog post you're looking for doesn't exist.</p>
        <Link to="/blog" className="blog-post-back-link">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${post.title} | Your Site Name`}
        description={post.description}
        type="article"
        url={`/blog/${post.slug}`}
        author={post.author}
        publishedTime={post.date}
        tags={post.tags}
      />

      <article className="blog-post">
        <header className="blog-post-header">
          <Link to="/blog" className="blog-post-back-link">
            ← Back to Blog
          </Link>

          <h1 className="blog-post-title">{post.title}</h1>

          <div className="blog-post-meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="blog-post-separator">•</span>
            <span className="blog-post-author">{post.author}</span>
          </div>

          {post.tags.length > 0 && (
            <div className="blog-post-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="blog-post-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="blog-post-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeHighlight,
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }]
            ]}
          >
            {post.content || ''}
          </ReactMarkdown>
        </div>

        <footer className="blog-post-footer">
          <Link to="/blog" className="blog-post-footer-link">
            ← Back to all posts
          </Link>
        </footer>
      </article>
    </>
  );
};

export default BlogPost;