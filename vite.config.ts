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
   * Plugins extend Vite’s core features.
   * The `react()` plugin adds React Fast Refresh (instant state-preserving reloads)
   * and support for JSX/TSX syntax.
   */
  plugins: [react()],
})

