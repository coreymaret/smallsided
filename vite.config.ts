// Import the `defineConfig` helper from Vite.
import { defineConfig } from 'vite'

// Import the official Vite plugin that enables React support,
// using the high-performance SWC compiler instead of Babel.
import react from '@vitejs/plugin-react-swc'

// Image optimization plugin
// Install: npm install -D vite-plugin-imagemin
import viteImagemin from 'vite-plugin-imagemin'

// Compression plugin for pre-compressing assets
// Install: npm install -D vite-plugin-compression
import viteCompression from 'vite-plugin-compression'

// Bundle analyzer to visualize bundle composition
// Install: npm install -D rollup-plugin-visualizer
import { visualizer } from 'rollup-plugin-visualizer'

// -------------------------------------------------------------
// Export the configuration using `defineConfig()`
// -------------------------------------------------------------
export default defineConfig({
  /**
   * PLUGINS
   * -------
   * Plugins extend Vite's core features.
   */
  plugins: [
    react(),
    
    // Image optimization - optimizes images during build
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true },
          { name: 'removeUnusedNS', active: true },
          { name: 'removeUselessStrokeAndFill', active: true },
          { name: 'cleanupIDs', active: true },
        ],
      },
    }),
    
    // Brotli compression - best compression ratio
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false, // Keep original files
    }),
    
    // Gzip compression - wider browser support
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false, // Keep original files
    }),
    
    // Bundle analyzer - visualize bundle composition
    visualizer({
      open: true, // Automatically open in browser after build
      gzipSize: true, // Show gzipped sizes
      brotliSize: true, // Show brotli sizes
      filename: 'dist/stats.html', // Output file
    }),
  ],

  /**
   * ASSETS INCLUDE
   * --------------
   * Tell Vite to treat markdown files (.md) as static assets.
   */
  assetsInclude: ['**/*.md'],

  /**
   * RESOLVE
   * -------
   * Configure module resolution options.
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
   */
  define: {
    'global': 'globalThis',
  },

  /**
   * ESBUILD OPTIONS
   * ---------------
   * Configure esbuild for transformation.
   */
  esbuild: {
    // Remove console.log and debugger statements in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Use legal comments to include license information
    legalComments: 'inline',
  },

  /**
   * BUILD OPTIONS
   * -------------
   * Configuration for the production build process.
   */
  build: {
    /**
     * OUTPUT DIRECTORY
     */
    outDir: 'dist',

    /**
     * SOURCE MAPS
     * -----------
     * Disable source maps in production to reduce bundle size.
     */
    sourcemap: false,

    /**
     * MINIFICATION
     * ------------
     * IMPROVED: Using Terser for better compression (5-10% smaller than esbuild)
     * Trade-off: Slightly slower build time but better production performance
     * Install: npm install -D terser
     */
    minify: 'terser',

    /**
     * TERSER OPTIONS
     * --------------
     * Advanced minification settings for maximum compression
     */
    terserOptions: {
      compress: {
        // Remove console statements
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        
        // Optimization passes (more passes = smaller output but slower build)
        passes: 2,
        
        // Use latest ECMAScript features for smaller output
        ecma: 2020,
        
        // Remove unused code
        dead_code: true,
        unused: true,
        
        // Inline functions
        inline: 2,
        
        // Additional optimizations
        booleans_as_integers: false, // Keep false for better compatibility
        keep_fargs: false,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
      },
      
      mangle: {
        // Mangle property names for smaller output
        properties: false, // Set to true only if you're confident (can break code)
        
        // Work around Safari 10 bugs
        safari10: true,
        
        // Keep class names for better debugging
        keep_classnames: false,
        keep_fnames: false,
      },
      
      format: {
        // Remove all comments except legal ones
        comments: false,
        
        // Use ECMAScript 2020+ syntax where possible
        ecma: 2020,
        
        // Compact output
        beautify: false,
        
        // Keep quoted property names for compatibility
        quote_style: 1,
      },
    },

    /**
     * CSS MINIFICATION
     * ----------------
     * IMPROVED: Use lightningcss for better CSS optimization
     */
    cssMinify: 'lightningcss',

    /**
     * TARGET
     * ------
     * Browser targets for output code
     */
    target: 'es2020',

    /**
     * CHUNK SIZE WARNING
     * ------------------
     * Warn if chunks exceed this size (in kB).
     */
    chunkSizeWarningLimit: 1000,

    /**
     * ROLLUP OPTIONS
     * --------------
     * Vite uses Rollup under the hood for bundling in production.
     */
    rollupOptions: {
      output: {
        /**
         * FILE NAMING WITH HASHES (for cache busting)
         */
        assetFileNames: (assetInfo) => {
          // Different cache strategies for different file types
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1] || '';
          
          // Images and fonts can be cached longer
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',

        /**
         * MANUAL CHUNKS
         * -------------
         * IMPROVED: Better code splitting strategy
         */
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React core (always needed)
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler')) {
              return 'react-core';
            }
            
            // React Router (always needed)
            if (id.includes('react-router')) {
              return 'react-router';
            }
            
            // Google Maps (ONLY Contact page)
            if (id.includes('google-maps') || id.includes('@react-google-maps')) {
              return 'google-maps';
            }
            
            // Lottie (ONLY if used)
            if (id.includes('lottie')) {
              return 'lottie';
            }
            
            // Markdown & Blog (ONLY blog pages)
            if (id.includes('react-markdown') || 
                id.includes('gray-matter') ||
                id.includes('rehype') || 
                id.includes('remark') ||
                id.includes('unified')) {
              return 'markdown';
            }
            
            // Highlight.js (ONLY code blocks)
            if (id.includes('highlight')) {
              return 'highlight';
            }
            
            // Lucide icons (UI library)
            if (id.includes('lucide-react')) {
              return 'lucide';
            }
            
            // React Helmet (SEO)
            if (id.includes('react-helmet')) {
              return 'seo';
            }
            
            // Everything else
            return 'vendor';
          }
        },

        /**
         * COMPACT OUTPUT
         */
        compact: true,
        
        /**
         * IMPROVED: Better interop handling
         */
        interop: 'auto',
        
        /**
         * Source map generation (set to false to reduce size)
         */
        sourcemap: false,
      },

      /**
       * TREESHAKING
       * -----------
       * IMPROVED: More aggressive tree-shaking
       */
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        
        // Annotations to guide tree-shaking
        annotations: true,
        
        // Unknown global side effects
        unknownGlobalSideEffects: false,
      },
      
      /**
       * PERFORMANCE
       * -----------
       * Optimize rollup performance
       */
      maxParallelFileOps: 20,
    },

    /**
     * REPORT COMPRESSED SIZE
     * ----------------------
     * Show gzipped sizes in build output.
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
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'buffer',
      // Add other commonly used dependencies
    ],
    exclude: [
      // Exclude large dependencies that should be lazy-loaded
    ],
  },

  /**
   * CLEAR SCREEN
   * ------------
   * Whether to clear the console when building
   */
  clearScreen: true,

  /**
   * SERVER OPTIONS
   * --------------
   * Development server configuration
   */
  server: {
    // Enable HTTPS in development (optional)
    // https: true,
    
    // Host
    host: true,
    
    // Port
    port: 5173,
    
    // Automatic browser opening
    open: false,
  },

  /**
   * PREVIEW OPTIONS
   * ---------------
   * Production preview server configuration
   */
  preview: {
    port: 4173,
    host: true,
  },
})