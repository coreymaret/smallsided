import purgecss from '@fullhuman/postcss-purgecss';

const purge = purgecss({
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: {
    standard: [
      /^_/,
      /^is-/,
      /^has-/,
      /^active/,
      /^show/,
      /^open/,
    ],
    deep: [/./], // prevents CSS module hashes from being wiped
  },
});

export default {
  plugins: [
    ...(process.env.NODE_ENV === 'production' ? [purge] : []),
  ],
};