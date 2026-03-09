/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // RGB channel pattern: allows Tailwind opacity modifiers like bg-lapis/20, border-espresso/30.
        // Each color has both a solid fallback (var(--color-x)) and an rgb() channel version.
        sand:       'rgb(var(--color-sand-rgb) / <alpha-value>)',
        linen:      'rgb(var(--color-linen-rgb) / <alpha-value>)',
        espresso:   'rgb(var(--color-espresso-rgb) / <alpha-value>)',
        terracotta: 'rgb(var(--color-terracotta-rgb) / <alpha-value>)',
        clay:       'rgb(var(--color-clay-rgb) / <alpha-value>)',
        amber:      'rgb(var(--color-amber-rgb) / <alpha-value>)',
        tan:        'rgb(var(--color-tan-rgb) / <alpha-value>)',
        muted:      'rgb(var(--color-muted-rgb) / <alpha-value>)',
        border:     'rgb(var(--color-border-rgb) / <alpha-value>)',
        lapis:      'rgb(var(--color-lapis-rgb) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)',     'system-ui', 'sans-serif'],
      },
      keyframes: {
        colorShift: {
          '0%, 100%': { color: 'var(--color-terracotta)' },
          '33%':      { color: 'var(--color-amber)' },
          '66%':      { color: 'var(--color-tan)' },
        },
        scrollTrack: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        colorShift:  'colorShift 9s ease-in-out infinite',
        scrollTrack: 'scrollTrack 55s linear infinite',
        fadeUp:      'fadeUp 0.55s ease forwards',
      },
    },
  },
  plugins: [],
};
