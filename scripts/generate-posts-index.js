// scripts/generate-posts-index.js
// --------------------------------------------------
// This script scans the blog content directory,
// reads all Markdown (.md) files,
// extracts frontmatter metadata,
// and generates a posts.json index file
// used by the frontend to list blog posts.
// --------------------------------------------------

// Node.js file system module
// Used for reading directories, files, and writing output
import fs from 'fs';

// Node.js path module
// Used to safely construct file paths across OSes
import path from 'path';

// gray-matter parses Markdown files
// and extracts YAML frontmatter metadata
import matter from 'gray-matter';

// Utility for converting ES module URLs to file paths
// (__dirname does not exist natively in ES modules)
import { fileURLToPath } from 'url';

// --------------------------------------------------
// Re-create __filename and __dirname for ES modules
// --------------------------------------------------

// Convert the current file’s URL into a real file path
const __filename = fileURLToPath(import.meta.url);

// Extract the directory name from the file path
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// Define important paths
// --------------------------------------------------

// Absolute path to the blog content directory
// This is where all Markdown blog posts live
const BLOG_DIR = path.join(__dirname, '../src/content/blog');

// Absolute path to the output JSON file
// This file will contain the index of all posts
const OUTPUT_FILE = path.join(BLOG_DIR, 'posts.json');

// --------------------------------------------------
// Main function that generates the blog index
// --------------------------------------------------
function generatePostsIndex() {
  console.log('🔍 Generating blog posts index...');

  // --------------------------------------------------
  // Ensure the blog directory exists
  // --------------------------------------------------
  // This prevents crashes if the directory
  // hasn’t been created yet (e.g. fresh install)
  if (!fs.existsSync(BLOG_DIR)) {
    console.log('📁 Creating blog directory...');
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }

  // --------------------------------------------------
  // Read all files in the blog directory
  // --------------------------------------------------
  // Filter to only include Markdown files
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter(file => file.endsWith('.md'));

  // --------------------------------------------------
  // Handle the case where no markdown files exist
  // --------------------------------------------------
  if (files.length === 0) {
    console.log('⚠️  No markdown files found. Creating empty posts.json');

    // Write an empty array so the frontend
    // can safely consume it without errors
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify([], null, 2));
    return;
  }

  console.log(`📝 Found ${files.length} markdown file(s)`);

  // --------------------------------------------------
  // Parse each Markdown file and extract metadata
  // --------------------------------------------------
  const posts = files.map(fileName => {
    // Full path to the markdown file
    const filePath = path.join(BLOG_DIR, fileName);

    // Read the raw contents of the file
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Extract frontmatter data using gray-matter
    // `data` contains the YAML frontmatter as an object
    const { data } = matter(fileContent);

    // --------------------------------------------------
    // Validate required frontmatter fields
    // --------------------------------------------------
    const requiredFields = [
      'title',
      'date',
      'description',
      'slug',
      'author'
    ];

    // Find any missing required fields
    const missingFields = requiredFields.filter(
      field => !data[field]
    );

    // Warn the developer but do NOT fail the build
    // This allows flexibility while still flagging issues
    if (missingFields.length > 0) {
      console.warn(
        `⚠️  Warning: ${fileName} is missing fields: ${missingFields.join(', ')}`
      );
    }

    // --------------------------------------------------
    // Return normalized post object
    // --------------------------------------------------
    // Defaults ensure the site never breaks
    // due to missing frontmatter
    return {
      // Post title
      title: data.title || 'Untitled',

      // Post date (defaults to today)
      date: data.date || new Date().toISOString().split('T')[0],

      // Short description for previews / SEO
      description: data.description || '',

      // URL-friendly identifier
      slug: data.slug || fileName.replace('.md', ''),

      // Post author
      author: data.author || 'Anonymous',

      // Optional array of tags
      tags: Array.isArray(data.tags) ? data.tags : [],

      // Flag for featured posts
      featured: data.featured || false,

      // Original file name (useful for debugging)
      fileName: fileName
    };
  });

  // --------------------------------------------------
  // Sort posts by date (newest first)
  // --------------------------------------------------
  posts.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // --------------------------------------------------
  // Write the final posts index to disk
  // --------------------------------------------------
  // Pretty-print with indentation for readability
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(posts, null, 2)
  );

  console.log(
    `✅ Successfully generated posts index with ${posts.length} post(s)`
  );
  console.log(`📍 Output: ${OUTPUT_FILE}`);
}

// --------------------------------------------------
// Execute the script safely
// --------------------------------------------------
// Wrapping in try/catch ensures
// CI builds and deploys fail loudly if something breaks
try {
  generatePostsIndex();
} catch (error) {
  console.error('❌ Error generating posts index:', error);
  process.exit(1);
}
