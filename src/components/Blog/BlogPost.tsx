// src/components/blog/BlogPost.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Twitter, Linkedin, Facebook, Link as LinkIcon, Check, ArrowLeft } from '../../components/Icons/Icons';
import { getPostBySlug, getAllPosts } from '../../utils/blogUtils';
import type { BlogPost as BlogPostType } from '../../types/blog';
import SEO from '../Blog/SEO';
import './BlogPost.scss';
import { formatDate } from '../../utils/blogUtils';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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

          const allPosts = await getAllPosts();
          const related = allPosts
            .filter(p => p.slug !== slug)
            .map(p => ({
              post: p,
              matchingTags: p.tags.filter(tag => postData.tags.includes(tag)).length
            }))
            .filter(p => p.matchingTags > 0)
            .sort((a, b) => b.matchingTags - a.matchingTags)
            .slice(0, 5)
            .map(p => p.post);

          setRelatedPosts(related);
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

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const progress = (scrollTop / trackLength) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shareUrl = window.location.href;
  const shareTitle = post?.title || '';

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      <div className="reading-progress-bar">
        <div
          className="reading-progress-fill"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <article className="blog-post">
        <div className="container">
          <div 
            className="blog-post-hero-image"
            style={{
              backgroundImage: post.heroImage 
                ? `url(${post.heroImage})`
                : 'linear-gradient(135deg, #98ED66 0%, #15141a 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Placeholder gradient shown when no heroImage is provided */}
          </div>

        <div className="floating-share">
          <button 
            className="share-button share-twitter"
            onClick={() => handleShare('twitter')}
            aria-label="Share on Twitter"
          >
            <Twitter size={20} />
          </button>
          <button 
            className="share-button share-linkedin"
            onClick={() => handleShare('linkedin')}
            aria-label="Share on LinkedIn"
          >
            <Linkedin size={20} />
          </button>
          <button 
            className="share-button share-facebook"
            onClick={() => handleShare('facebook')}
            aria-label="Share on Facebook"
          >
            <Facebook size={20} />
          </button>
          <button 
            className="share-button share-link"
            onClick={handleCopyLink}
            aria-label="Copy link"
          >
            {copied ? <Check size={20} /> : <LinkIcon size={20} />}
          </button>
        </div>

        <header className="blog-post-header">
          <h1 className="blog-post-title">{post.title}</h1>

          <div className="blog-post-meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="blog-post-separator">•</span>
            <div className="blog-post-author-wrapper">
              {post.authorImage ? (
                <div className="blog-post-author-avatar">
                  <img 
                    src={post.authorImage} 
                    alt={post.author}
                    width="40"
                    height="40"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.nextElementSibling;
                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                    }}
                  />
                </div>
              ) : null}
              <div 
                className="blog-post-author-fallback"
                style={{ display: post.authorImage ? 'none' : 'flex' }}
              >
                {post.author.charAt(0).toUpperCase()}
              </div>
              <span className="blog-post-author">{post.author}</span>
            </div>
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
          <MarkdownRenderer
            content={post.content || ''}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeRaw,
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }]
            ]}
            components={{
              table: ({ children }) => (
                <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                  <table>{children}</table>
                </div>
              )
            }}
          />
        </div>

        <div className="author-box">
          <div className="author-avatar">
            {post.author.charAt(0).toUpperCase()}
          </div>
          <div className="author-info">
            <h3 className="author-name">{post.author}</h3>
            <p className="author-bio">
              Passionate writer and developer sharing insights on technology, design, and innovation.
            </p>
          </div>
        </div>

        <div className="share-section">
          <h3 className="share-title">Share this article</h3>
          <div className="share-buttons">
            <button className="share-button-large share-twitter" onClick={() => handleShare('twitter')}>
              <Twitter size={18} /> Twitter
            </button>
            <button className="share-button-large share-linkedin" onClick={() => handleShare('linkedin')}>
              <Linkedin size={18} /> LinkedIn
            </button>
            <button className="share-button-large share-facebook" onClick={() => handleShare('facebook')}>
              <Facebook size={18} /> Facebook
            </button>
            <button className="share-button-large share-link" onClick={handleCopyLink}>
              {copied ? <Check size={18} /> : <LinkIcon size={18} />} {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="related-posts">
            <h2 className="related-posts-title">Related Articles</h2>
            <div className="related-posts-carousel">
              <div className="related-posts-track">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    to={`/blog/${relatedPost.slug}`}
                    className="related-post-card"
                  >
                    <div className="related-post-tags">
                      {relatedPost.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="related-post-tag">{tag}</span>
                      ))}
                    </div>
                    <h3 className="related-post-title">{relatedPost.title}</h3>
                    <p className="related-post-description">{relatedPost.description}</p>
                    <div className="related-post-meta">
                      <time>{formatDate(relatedPost.date)}</time>
                      <span className="related-post-arrow">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <footer className="blog-post-footer">
          <Link to="/blog" className="blog-post-footer-link">
            <ArrowLeft size={20} />
            Back to all posts
          </Link>
        </footer>
        </div>
      </article>
    </>
  );
};

export default BlogPost;