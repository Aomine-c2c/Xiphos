/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{rs,html,css}",
  ],
  theme: {
    extend: {
      colors: {
        'xiphos-bg': '#0a0a0f',
        'xiphos-panel': '#0f111a',
        'xiphos-cyan': '#4cc9f0',
        'xiphos-purple': '#8b5cf6',
        'xiphos-emerald': '#4ade80',
        'xiphos-crimson': '#f87171',
        'xiphos-gold': '#f59e0b',
        'xiphos-muted': '#a1a1aa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
