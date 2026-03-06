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
        // All colors are driven by CSS custom properties.
        // This lets a single '.dark' class on <html> flip the entire palette.
        sand:       'var(--color-sand)',
        linen:      'var(--color-linen)',
        espresso:   'var(--color-espresso)',
        terracotta: 'var(--color-terracotta)',
        clay:       'var(--color-clay)',
        amber:      'var(--color-amber)',
        tan:        'var(--color-tan)',
        muted:      'var(--color-muted)',
        border:     'var(--color-border)',
        lapis:      'var(--color-lapis)',
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
