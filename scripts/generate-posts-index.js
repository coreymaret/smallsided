// scripts/generate-posts-index.js

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const OUTPUT_FILE = path.join(BLOG_DIR, 'posts.json');

function generatePostsIndex() {
  console.log('🔍 Generating blog posts index...');

  // Ensure blog directory exists
  if (!fs.existsSync(BLOG_DIR)) {
    console.log('📁 Creating blog directory...');
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }

  // Read all markdown files
  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('⚠️  No markdown files found. Creating empty posts.json');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify([], null, 2));
    return;
  }

  console.log(`📝 Found ${files.length} markdown file(s)`);

  // Parse each file and extract frontmatter
  const posts = files.map(fileName => {
    const filePath = path.join(BLOG_DIR, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);

    // Validate required fields
    const requiredFields = ['title', 'date', 'description', 'slug', 'author'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      console.warn(`⚠️  Warning: ${fileName} is missing fields: ${missingFields.join(', ')}`);
    }

    return {
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString().split('T')[0],
      description: data.description || '',
      slug: data.slug || fileName.replace('.md', ''),
      author: data.author || 'Anonymous',
      tags: Array.isArray(data.tags) ? data.tags : [],
      featured: data.featured || false,
      fileName: fileName
    };
  });

  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Write to JSON file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));

  console.log(`✅ Successfully generated posts index with ${posts.length} post(s)`);
  console.log(`📍 Output: ${OUTPUT_FILE}`);
}

// Run the script
try {
  generatePostsIndex();
} catch (error) {
  console.error('❌ Error generating posts index:', error);
  process.exit(1);
}