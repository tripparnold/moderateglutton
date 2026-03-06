/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sand:       '#EDE8DF',
        linen:      '#E5DED3',
        espresso:   '#2C1810',
        terracotta: '#A8502A',
        clay:       '#8B3F20',
        amber:      '#C4843A',
        tan:        '#7A6248',
        muted:      '#9A8A78',
        border:     '#E2D8CC',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)',     'system-ui', 'sans-serif'],
      },
      keyframes: {
        colorShift: {
          '0%, 100%': { color: '#A8502A' },
          '33%':      { color: '#C4843A' },
          '66%':      { color: '#7A6248' },
        },
        scrollTrack: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        colorShift:  'colorShift 9s ease-in-out infinite',
        scrollTrack: 'scrollTrack 55s linear infinite',
      },
    },
  },
  plugins: [],
};
