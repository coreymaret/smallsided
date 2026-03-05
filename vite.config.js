// Import the `defineConfig` helper from Vite.
import { defineConfig } from 'vite';
// Import the official Vite plugin that enables React support,
// using the high-performance SWC compiler instead of Babel.
import react from '@vitejs/plugin-react-swc';
// Image optimization plugin
import viteImagemin from 'vite-plugin-imagemin';
// Compression plugin for pre-compressing assets
import viteCompression from 'vite-plugin-compression';
// Bundle analyzer to visualize bundle composition
import { visualizer } from 'rollup-plugin-visualizer';
export default defineConfig({
    plugins: [
        react(),
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
        viteCompression({
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 10240,
            deleteOriginFile: false,
        }),
        viteCompression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 10240,
            deleteOriginFile: false,
        }),
        visualizer({
            open: true,
            gzipSize: true,
            brotliSize: true,
            filename: 'dist/stats.html',
        }),
    ],
    assetsInclude: ['**/*.md'],
    esbuild: {
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
        legalComments: 'inline',
    },
    build: {
        modulePreload: false,
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild',
        cssMinify: 'lightningcss',
        target: 'es2020',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name?.split('.') || [];
                    const ext = info[info.length - 1] || '';
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
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        // WHITELIST: Only packages needed on EVERY page get a named chunk.
                        // Everything else returns undefined so Rollup bundles it with
                        // whatever lazy route actually imports it.
                        if (id.includes('react/') ||
                            id.includes('react-dom/') ||
                            id.includes('scheduler')) {
                            return 'react-core';
                        }
                        if (id.includes('react-router') || id.includes('@remix-run/router')) {
                            return 'router';
                        }
                        if (id.includes('react-helmet') || id.includes('react-fast-compare') || id.includes('invariant') || id.includes('shallowequal')) {
                            return 'seo';
                        }
                        if (id.includes('lucide-react')) {
                            return 'lucide';
                        }
                        // Everything else: let Rollup code-split naturally
                        // with lazy routes. Do NOT put in a 'vendor' catch-all.
                        return undefined;
                    }
                },
                compact: true,
                interop: 'auto',
                sourcemap: false,
            },
            treeshake: {
                moduleSideEffects: 'no-external',
                propertyReadSideEffects: false,
                tryCatchDeoptimization: false,
                annotations: true,
                unknownGlobalSideEffects: false,
            },
            maxParallelFileOps: 20,
        },
        reportCompressedSize: true,
        assetsDir: 'assets',
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
        ],
        exclude: [],
    },
    clearScreen: true,
    server: {
        host: true,
        port: 5173,
        open: false,
    },
    preview: {
        port: 4173,
        host: true,
    },
});
