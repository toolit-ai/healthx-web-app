import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'var(--line)',
        input: 'var(--line)',
        ring: 'var(--jade)',
        background: 'var(--bg)',
        foreground: 'var(--ink)',
        primary: {
          DEFAULT: 'var(--ink)',
          foreground: 'var(--bg)',
        },
        secondary: {
          DEFAULT: 'var(--bg-soft)',
          foreground: 'var(--ink)',
        },
        destructive: {
          DEFAULT: 'var(--crimson)',
          foreground: '#fbf8f1',
        },
        muted: {
          DEFAULT: 'var(--bg-soft)',
          foreground: 'var(--ink-soft)',
        },
        accent: {
          DEFAULT: 'var(--jade)',
          foreground: '#fbf8f1',
        },
        popover: {
          DEFAULT: 'var(--bg-card)',
          foreground: 'var(--ink)',
        },
        card: {
          DEFAULT: 'var(--bg-card)',
          foreground: 'var(--ink)',
        },
        status: {
          'not-started': 'var(--ink-mute)',
          running: 'var(--indigo)',
          completed: 'var(--jade)',
          failed: 'var(--crimson)',
          blocked: 'var(--terra)',
          partial: 'var(--amber)',
          waiting: 'var(--amber)',
          reindexing: 'var(--indigo)',
        },
        conflict: {
          bg: 'oklch(0.95 0.06 75)',
          text: 'oklch(0.4 0.13 75)',
          border: 'oklch(0.95 0.06 75)',
        },
      },
      borderRadius: {
        lg: 'var(--r-3)',
        md: 'var(--r-2)',
        sm: 'var(--r-1)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        display: ['var(--font-display)'],
      },
      fontSize: {
        '2xs': '10px',
      },
    },
  },
  plugins: [],
} satisfies Config
