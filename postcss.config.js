// postcss.config.js

import purgecss from '@fullhuman/postcss-purgecss';

const purge = purgecss({
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  defaultExtractor: (content) =>
    content.match(/[\w-/:]+(?<!:)/g) || [],
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

export default {
  plugins: [
    ...(process.env.NODE_ENV === 'production' ? [purge] : []),
  ],
};