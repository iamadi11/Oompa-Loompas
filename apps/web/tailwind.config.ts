import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        /** Parchment field — warm factory floor */
        canvas: {
          DEFAULT: '#f4ead8',
          muted: '#ebe3cf',
        },
        surface: {
          DEFAULT: '#faf6ec',
          raised: '#fffefb',
        },
        line: {
          DEFAULT: '#d4c4a8',
          strong: '#b8a684',
        },
        /**
         * Chocolate + antique gold — premium “atelier” accent (not toy primary colors).
         */
        brand: {
          50: '#fdf8ed',
          100: '#f8ecd4',
          200: '#efd9b0',
          300: '#e3bf82',
          400: '#d4a054',
          500: '#c4853a',
          600: '#a86b2e',
          700: '#8a5528',
          800: '#5c3a1c',
          900: '#3d2914',
        },
        gold: {
          soft: '#c9a227',
          rich: '#b8860b',
          glow: 'rgba(201, 162, 39, 0.35)',
        },
      },
      ringOffsetColor: {
        canvas: '#f4ead8',
      },
      boxShadow: {
        card: '0 1px 0 rgba(61, 41, 20, 0.06), 0 14px 36px -10px rgba(61, 41, 20, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.45)',
        'card-hover':
          '0 1px 0 rgba(61, 41, 20, 0.08), 0 22px 48px -12px rgba(201, 162, 39, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
        header: '0 1px 0 rgba(61, 41, 20, 0.07), 0 8px 24px -8px rgba(61, 41, 20, 0.08)',
        glow: '0 0 40px -8px rgba(201, 162, 39, 0.45)',
      },
      backgroundImage: {
        'mesh-page':
          'radial-gradient(ellipse 130% 90% at 100% -25%, rgba(201, 162, 39, 0.14) 0%, transparent 55%), radial-gradient(ellipse 100% 80% at -5% 105%, rgba(139, 90, 43, 0.08) 0%, transparent 52%), radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255, 255, 255, 0.5) 0%, transparent 70%)',
      },
      keyframes: {
        'shimmer-gold': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'shimmer-gold': 'shimmer-gold 4.5s ease-in-out infinite',
        'float-soft': 'float-soft 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
