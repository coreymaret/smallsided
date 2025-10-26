// generate-sitemap.cjs
const { SitemapStream, streamToPromise } = require('sitemap');
const { writeFileSync } = require('fs');
const path = require('path');

// Site URL
const SITE_URL = 'https://www.smallsided.com';

// Pages list (can extend or dynamically generate)
const pages = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.8 },
  { url: '/contact', changefreq: 'monthly', priority: 0.8 },
  { url: '/work', changefreq: 'monthly', priority: 0.8 },
  { url: '/services', changefreq: 'monthly', priority: 0.8 },
];

// Generate sitemap stream
const sitemapStream = new SitemapStream({ hostname: SITE_URL });
pages.forEach(page => sitemapStream.write(page));
sitemapStream.end();

// Write sitemap to dist folder after Vite build
streamToPromise(sitemapStream)
  .then(data => {
    const filePath = path.join(__dirname, 'dist', 'sitemap.xml');
    writeFileSync(filePath, data);
    console.log(`Sitemap generated at ${filePath}`);
  })
  .catch(err => console.error(err));
