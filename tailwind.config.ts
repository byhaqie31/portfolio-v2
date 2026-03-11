import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        // Vercel/Linear dark palette
        surface: {
          DEFAULT: '#0a0a0a',
          1: '#111111',
          2: '#1a1a1a',
          3: '#222222',
        },
        border: {
          DEFAULT: '#1f1f1f',
          subtle: '#161616',
        },
        text: {
          primary: '#ededed',
          secondary: '#a1a1a1',
          muted: '#666666',
        },
        accent: {
          DEFAULT: '#ffffff',
          muted: '#888888',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
