// @ts-check
/**
 * @file Tailwind CSS CDN configuration for CivicLens India.
 * @description Externalised from index.html to eliminate 'unsafe-inline' in CSP script-src.
 */
/* global tailwind */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        civic: {
          deep:   '#000080',
          accent: '#FF9933',
          green:  '#138808',
          paper:  '#FFF8F0',
          ink:    '#1a1a1a'
        }
      },
      fontFamily: { serif: ['Georgia', 'serif'], sans: ['system-ui', 'sans-serif'] }
    }
  }
};
