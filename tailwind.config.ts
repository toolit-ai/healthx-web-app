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
        border: 'hsl(var(--healthx-border))',
        input: 'hsl(var(--healthx-input))',
        ring: 'hsl(var(--healthx-ring))',
        background: 'hsl(var(--healthx-background))',
        foreground: 'hsl(var(--healthx-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--healthx-primary))',
          foreground: 'hsl(var(--healthx-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--healthx-secondary))',
          foreground: 'hsl(var(--healthx-secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--healthx-destructive))',
          foreground: 'hsl(var(--healthx-destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--healthx-muted))',
          foreground: 'hsl(var(--healthx-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--healthx-accent))',
          foreground: 'hsl(var(--healthx-accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--healthx-popover))',
          foreground: 'hsl(var(--healthx-popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--healthx-card))',
          foreground: 'hsl(var(--healthx-card-foreground))',
        },
        status: {
          'not-started': 'hsl(var(--healthx-status-not-started))',
          running: 'hsl(var(--healthx-status-running))',
          completed: 'hsl(var(--healthx-status-completed))',
          failed: 'hsl(var(--healthx-status-failed))',
          blocked: 'hsl(var(--healthx-status-blocked))',
          partial: 'hsl(var(--healthx-status-partial))',
          waiting: 'hsl(var(--healthx-status-waiting))',
        },
      },
      borderRadius: {
        lg: 'var(--healthx-radius)',
        md: 'calc(var(--healthx-radius) - 2px)',
        sm: 'calc(var(--healthx-radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--healthx-font-sans)'],
        mono: ['var(--healthx-font-mono)'],
      },
    },
  },
  plugins: [],
} satisfies Config
