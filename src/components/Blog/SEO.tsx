// src/components/blog/SEO.tsx

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  type?: 'website' | 'article';
  url?: string;
  image?: string;
  author?: string;
  publishedTime?: string;
  tags?: string[];
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  type = 'website',
  url,
  image = '/default-og-image.jpg',
  author,
  publishedTime,
  tags
}) => {
  const siteUrl = window.location.origin;
  const fullUrl = url ? `${siteUrl}${url}` : window.location.href;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />

      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* JSON-LD Structured Data */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: title,
            description: description,
            image: fullImageUrl,
            datePublished: publishedTime,
            author: {
              '@type': 'Person',
              name: author
            },
            publisher: {
              '@type': 'Organization',
              name: 'Your Site Name',
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/logo.png`
              }
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': fullUrl
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;