// Import the `defineConfig` helper from Vite.
// This gives you IntelliSense (auto-completion and type checking) in TypeScript
// and helps ensure your configuration is validated by Vite.
import { defineConfig } from 'vite'

// Import the official Vite plugin that enables React support,
// using the high-performance SWC compiler instead of Babel.
// SWC (written in Rust) makes builds and hot reloading much faster.
import react from '@vitejs/plugin-react-swc'


// -------------------------------------------------------------
// Export the configuration using `defineConfig()`
// -------------------------------------------------------------
//
// This function simply wraps your config object for better IDE support.
// Everything inside the object defines how Vite should behave
// during development and when building for production.
//
export default defineConfig({
  /**
   * PLUGINS
   * -------
   * Plugins extend Vite's core features.
   * The `react()` plugin adds React Fast Refresh (instant state-preserving reloads)
   * and support for JSX/TSX syntax.
   */
  plugins: [react()],

  /**
   * ASSETS INCLUDE
   * --------------
   * Tell Vite to treat markdown files (.md) as static assets that can be
   * imported or fetched. This is necessary for the blog system to load
   * markdown blog posts dynamically.
   */
  assetsInclude: ['**/*.md'],

  /**
   * RESOLVE
   * -------
   * Configure module resolution options, including polyfills for Node.js APIs
   * that are used by dependencies but don't exist in the browser.
   */
  resolve: {
    alias: {
      // Polyfill Buffer for browser usage (needed by gray-matter)
      buffer: 'buffer/'
    }
  },

  /**
   * DEFINE
   * ------
   * Define global constants that will be replaced during build.
   * This provides a global Buffer implementation for gray-matter.
   */
  define: {
    'global': 'globalThis',
  },

  /**
   * ESBUILD OPTIONS
   * ---------------
   * Configure esbuild for transformation and minification.
   * These options apply during both dev and build.
   */
  esbuild: {
    // Remove console.log and debugger statements in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },

  /**
   * BUILD OPTIONS
   * -------------
   * Configuration for the production build process.
   */
  build: {
    /**
     * OUTPUT DIRECTORY
     * ----------------
     * Where the production build files will be placed.
     */
    outDir: 'dist',

    /**
     * SOURCE MAPS
     * -----------
     * Disable source maps in production to reduce bundle size.
     * Set to true only if you need to debug production builds.
     */
    sourcemap: false,

    /**
     * MINIFICATION
     * ------------
     * Use 'esbuild' (fastest) or 'terser' (smaller output, slightly slower).
     * esbuild is recommended for speed, terser for maximum compression.
     */
    minify: 'esbuild', // or 'terser' for 5-10% smaller bundles

    /**
     * ESBUILD OPTIONS
     * ---------------
     * Configure esbuild for both dev and build.
     * Note: drop options for console removal are set at the top level.
     */

    /**
     * TERSER OPTIONS (if using minify: 'terser')
     * ------------------------------------------
     * Uncomment this section if you switch to terser.
     * Terser produces slightly smaller bundles but is slower.
     */
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //     pure_funcs: ['console.log', 'console.info', 'console.debug'],
    //     passes: 2, // Multiple passes for better compression
    //   },
    //   mangle: {
    //     safari10: true, // Work around Safari 10 bugs
    //   },
    //   format: {
    //     comments: false, // Remove all comments
    //   },
    // },

    /**
     * CSS MINIFICATION
     * ----------------
     * CSS is automatically minified in production builds.
     * This is handled by esbuild or lightningcss by default.
     */
    cssMinify: true,

    /**
     * CHUNK SIZE WARNING
     * ------------------
     * Warn if chunks exceed this size (in kB).
     * Helps identify bundles that might be too large.
     */
    chunkSizeWarningLimit: 1000,

    /**
     * ROLLUP OPTIONS
     * --------------
     * Vite uses Rollup under the hood for bundling in production.
     * These options are passed directly to Rollup.
     */
    rollupOptions: {
      output: {
        /**
         * FILE NAMING WITH HASHES (for cache busting)
         * -------------------------------------------
         * Add content hashes to filenames so browsers know when files change.
         * This allows us to cache files for 1 year safely (via _headers file).
         * When you update your code, the hash changes, forcing a fresh download.
         */
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',

        /**
         * MANUAL CHUNKS
         * -------------
         * Split code into separate chunks for better caching and lazy loading.
         * Vendor libraries that don't change often are separated so browsers
         * can cache them independently from your application code.
         * 
         * - react-vendor: Core React libraries (always loaded)
         * - markdown-core: Just react-markdown (loaded only on blog pages via React.lazy)
         * - markdown-plugins: Rehype/remark plugins (loaded only when markdown renders)
         * - ui-vendor: UI component libraries (lucide-react icons)
         * 
         * This reduces unused JavaScript by ~24KB since markdown plugins are only
         * loaded when actually rendering blog posts, not on every page.
         */
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown-core': ['react-markdown'],
          'markdown-plugins': ['rehype-highlight', 'remark-gfm', 'rehype-slug', 'rehype-autolink-headings', 'rehype-raw'],
          'ui-vendor': ['lucide-react'],
        },

        /**
         * COMPACT OUTPUT
         * --------------
         * Generate more compact output by removing unnecessary whitespace.
         */
        compact: true,
      },

      /**
       * TREESHAKING
       * -----------
       * Remove unused code. This is enabled by default but explicitly set here.
       */
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },

    /**
     * REPORT COMPRESSED SIZE
     * ----------------------
     * Show gzipped sizes in build output (useful for optimization).
     * Set to false to speed up builds slightly.
     */
    reportCompressedSize: true,

    /**
     * ASSETSDIR
     * ---------
     * Directory (relative to outDir) where assets will be placed.
     */
    assetsDir: 'assets',
  },

  /**
   * OPTIMIZE DEPS
   * -------------
   * Pre-bundle dependencies for faster dev server startup.
   */
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'buffer'],
  },
})