// src/components/Blog/BlogPost.tsx

// Styles
import styles from './BlogPost.module.scss';

// React
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// SEO
import SEO from '../SEO/SEO';

// Components
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';

// Markdown Plugins
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

// Icons
import {
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  Check,
  ArrowLeft,
} from '../../components/Icons/Icons';

// Utilities & Types
import { getPostBySlug, getAllPosts, formatDate } from '../../utils/blogUtils';
import type { BlogPost as BlogPostType } from '../../types/blog';

/**
 * Individual blog post page with reading progress bar,
 * floating share buttons, author box, and related posts.
 */
const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  /** Load post and find related posts by matching tags */
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
              matchingTags: p.tags.filter(tag => postData.tags.includes(tag)).length,
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

  /** Track scroll progress for reading progress bar */
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

  /** Open share dialog for the given platform */
  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  /** Copy current URL to clipboard */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Loading state */
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading post...</p>
      </div>
    );
  }

  /* Error state */
  if (error || !post) {
    return (
      <div className={styles.error}>
        <h1>Post Not Found</h1>
        <p>The blog post you're looking for doesn't exist.</p>
        <Link to="/blog" className={styles.backLink}>
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* SEO meta tags */}
      <SEO
        title={`${post.title} | Small Sided`}
        description={post.description}
        type="article"
        url={`/blog/${post.slug}`}
        author={post.author}
        publishedTime={post.date}
        tags={post.tags}
      />

      {/* Reading progress bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <article className={styles.article}>
        <div className={styles.container}>

          {/* Hero image */}
          <div
            className={styles.heroImage}
            style={{
              backgroundImage: post.heroImage
                ? `url(${post.heroImage})`
                : 'linear-gradient(135deg, #98ED66 0%, #15141a 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          ></div>

          {/* Floating share buttons (desktop only) */}
          <div className={styles.floatingShare}>
            <button onClick={() => handleShare('twitter')} aria-label="Share on Twitter">
              <Twitter size={20} />
            </button>
            <button onClick={() => handleShare('linkedin')} aria-label="Share on LinkedIn">
              <Linkedin size={20} />
            </button>
            <button onClick={() => handleShare('facebook')} aria-label="Share on Facebook">
              <Facebook size={20} />
            </button>
            <button onClick={handleCopyLink} aria-label="Copy link">
              {copied ? <Check size={20} /> : <LinkIcon size={20} />}
            </button>
          </div>

          {/* Post header */}
          <header className={styles.header}>
            <h1 className={styles.title}>{post.title}</h1>

            <div className={styles.meta}>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span className={styles.separator}>•</span>
              <div className={styles.authorWrapper}>
                {post.authorImage ? (
                  <div className={styles.authorAvatar}>
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
                  className={styles.authorFallback}
                  style={{ display: post.authorImage ? 'none' : 'flex' }}
                >
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <span className={styles.authorName}>{post.author}</span>
              </div>
            </div>

            {post.tags.length > 0 && (
              <div className={styles.tags}>
                {post.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </header>

          {/* Markdown content */}
          <div className={styles.content}>
            <MarkdownRenderer
              content={post.content || ''}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeRaw,
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap' }],
              ]}
              components={{
                table: ({ children }) => (
                  <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <table>{children}</table>
                  </div>
                ),
              }}
            />
          </div>

          {/* Author box */}
          <div className={styles.authorBox}>
            <div className={styles.authorBoxAvatar}>
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className={styles.authorBoxName}>{post.author}</h3>
              <p className={styles.authorBoxBio}>
                Passionate writer and developer sharing insights on technology, design, and innovation.
              </p>
            </div>
          </div>

          {/* Share section */}
          <div className={styles.shareSection}>
            <h3 className={styles.shareTitle}>Share this article</h3>
            <div className={styles.shareButtons}>
              <button className={styles.shareButtonLarge} onClick={() => handleShare('twitter')}>
                <Twitter size={18} /> Twitter
              </button>
              <button className={styles.shareButtonLarge} onClick={() => handleShare('linkedin')}>
                <Linkedin size={18} /> LinkedIn
              </button>
              <button className={styles.shareButtonLarge} onClick={() => handleShare('facebook')}>
                <Facebook size={18} /> Facebook
              </button>
              <button className={styles.shareButtonLarge} onClick={handleCopyLink}>
                {copied ? <Check size={18} /> : <LinkIcon size={18} />} {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className={styles.relatedPosts}>
              <h2 className={styles.relatedPostsTitle}>Related Articles</h2>
              <div className={styles.relatedCarousel}>
                <div className={styles.relatedTrack}>
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.slug}
                      to={`/blog/${relatedPost.slug}`}
                      className={styles.relatedCard}
                    >
                      <div className={styles.relatedTags}>
                        {relatedPost.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className={styles.relatedTag}>{tag}</span>
                        ))}
                      </div>
                      <h3 className={styles.relatedCardTitle}>{relatedPost.title}</h3>
                      <p className={styles.relatedCardDescription}>{relatedPost.description}</p>
                      <div className={styles.relatedCardMeta}>
                        <time>{formatDate(relatedPost.date)}</time>
                        <span className={styles.relatedArrow}>→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Back to blog */}
          <footer className={styles.footer}>
            <Link to="/blog" className={styles.footerLink}>
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