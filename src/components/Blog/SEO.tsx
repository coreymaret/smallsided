// src/components/Blog/SEO.tsx

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  // Basic Meta
  title: string;
  description: string;
  keywords?: string;
  
  // Page Info
  type?: 'website' | 'article';
  url?: string;
  
  // Images
  image?: string;
  imageAlt?: string;
  
  // Article Specific (for blog posts)
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  section?: string;
  
  // Social
  twitterHandle?: string;
  
  // Advanced
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  
  // Schema.org structured data
  schema?: object;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  type = 'website',
  url,
  image = '/og-image.jpg',
  imageAlt = 'Small Sided',
  author,
  publishedTime,
  modifiedTime,
  tags,
  section,
  twitterHandle = '@SmallSided',
  canonical,
  noindex = false,
  nofollow = false,
  schema
}) => {
  const siteUrl = 'https://www.smallsided.com';
  const fullUrl = url ? `${siteUrl}${url}` : window.location.href;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const canonicalUrl = canonical || fullUrl;

  // Default schema for website pages
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebPage',
    '@id': fullUrl,
    url: fullUrl,
    name: title,
    description: description,
    image: fullImageUrl,
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Small Sided',
      description: 'Small field. Big impact.'
    }
  };

  // Article schema for blog posts
  const articleSchema = type === 'article' ? {
    ...defaultSchema,
    '@type': 'Article',
    headline: title,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: author || 'Small Sided Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Small Sided',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl
    },
    articleSection: section || 'General',
    keywords: tags?.join(', ') || keywords
  } : defaultSchema;

  const finalSchema = schema || articleSchema;

  // Robots meta
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  if (robotsContent.length === 0) robotsContent.push('index', 'follow');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Robots */}
      <meta name="robots" content={robotsContent.join(', ')} />
      <meta name="googlebot" content={robotsContent.join(', ')} />
      
      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Small Sided" />
      <meta property="og:locale" content="en_US" />

      {/* Article specific OG tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />

      {/* Additional Meta for Better Indexing */}
      <meta name="author" content={author || 'Small Sided'} />
      <meta name="publisher" content="Small Sided" />
      {publishedTime && <meta name="publish_date" property="og:publish_date" content={publishedTime} />}
      <meta property="og:updated_time" content={modifiedTime || new Date().toISOString()} />

      {/* Mobile */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Small Sided" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;