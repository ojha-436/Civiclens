/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.{html,js}'],
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
  },
  plugins: [],
};
