// postcss.config.js

const purgecss = require('@fullhuman/postcss-purgecss')({
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  defaultExtractor: (content) => {
    return content.match(/[\w-/:]+(?<!:)/g) || [];
  },
  safelist: {
    standard: [
      /^is-/,
      /^has-/,
      /^active/,
      /^show/,
      /^open/,
    ],
  },
});

module.exports = {
  plugins: [
    ...(process.env.NODE_ENV === 'production' ? [purgecss] : []),
  ],
};