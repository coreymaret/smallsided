// Import ESLint’s built-in JavaScript rule set definitions
// The `@eslint/js` package provides official "recommended" configurations
import js from "@eslint/js";

// Import a helper that defines global variables for various environments
// e.g. browser, node, webworker, etc.
// This lets ESLint know about built-in globals like `window` and `document`
import globals from "globals";

// Import the TypeScript ESLint plugin + parser
// This allows ESLint to understand and lint TypeScript syntax (.ts / .tsx files)
import tseslint from "typescript-eslint";

// Import the React plugin for ESLint
// Adds React-specific linting rules (e.g. for hooks, JSX, prop types, etc.)
import pluginReact from "eslint-plugin-react";

// Import the helper function that defines ESLint configuration
// The `defineConfig()` function adds type safety and validation for ESLint’s flat config
import { defineConfig } from "eslint/config";


// ----------------------------------------------------------
// EXPORT ESLINT CONFIGURATION
// ----------------------------------------------------------
// ESLint’s new flat config system expects an array of config objects.
// Each object can target certain file types and apply different settings/rules.
export default defineConfig([
  {
    // Which files this configuration applies to:
    // Here it covers all JS, TS, and JSX/TSX files (including module variants)
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],

    // Register the core ESLint JS plugin
    plugins: { js },

    // Extend the official JavaScript "recommended" rules
    // (these include rules like `no-unused-vars`, `no-undef`, etc.)
    extends: ["js/recommended"],

    // Define the global environment
    // This tells ESLint that browser globals like `window` and `document` are available
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Add TypeScript ESLint recommended rules
  // These rules handle TypeScript-specific syntax and types
  tseslint.configs.recommended,

  // Add React plugin’s recommended configuration
  // This includes helpful defaults for React apps (hooks rules, JSX rules, etc.)
  pluginReact.configs.flat.recommended,
]);
