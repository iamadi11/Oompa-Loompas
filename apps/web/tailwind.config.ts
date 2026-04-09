import type { Config } from 'tailwindcss'

/**
 * Oompa Design System — Midnight Black + Crimson Red
 *
 * Psychology rationale:
 *  • Black (#0A0A0A): Power, authority, premium luxury — signals trust
 *  • Crimson (#E12B2B): Dopamine-triggering warm red — excitement, urgency, desire
 *    Slightly desaturated vs pure red → reads premium, not alarming
 *    High contrast on black → instant attention capture
 *
 * Theme is configurable: swap brand.600 + brand.700 for any accent color.
 */
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        /** Midnight black page field */
        canvas: {
          DEFAULT: '#0A0A0A',
          muted: '#0D0D0D',
        },
        surface: {
          DEFAULT: '#111111',
          raised: '#1A1A1A',
        },
        line: {
          DEFAULT: '#2D2D2D',
          strong: '#404040',
        },
        /**
         * Crimson Red — dopamine trigger + trust on dark backgrounds.
         * 600 = primary accent. 700 = button bg. 800 = hover.
         */
        brand: {
          50: '#FFF1F1',
          100: '#FFE0E0',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#E12B2B',
          700: '#C41E1E',
          800: '#A01616',
          900: '#7B0F0F',
        },
        /** Red glow accent (reuses brand red semantics) */
        gold: {
          soft: '#E12B2B',
          rich: '#C41E1E',
          glow: 'rgba(225, 43, 43, 0.20)',
        },
        /**
         * Stone scale — inverted for dark-mode semantics.
         * stone-900 = near-white (primary text on dark).
         * stone-500 = muted text. stone-100 = very dark surface.
         */
        stone: {
          50: '#0D0D0D',
          100: '#141416',
          200: '#1C1C1E',
          300: '#27272A',
          400: '#3F3F46',
          500: '#71717A',
          600: '#A1A1AA',
          700: '#D4D4D8',
          800: '#E4E4E7',
          900: '#F9F9F9',
        },
      },
      ringOffsetColor: {
        canvas: '#0A0A0A',
      },
      boxShadow: {
        /** Inset top highlight + deep black drop shadow */
        card: '0 0 0 1px rgba(255,255,255,0.04), 0 14px 36px -10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        /** Red glow on hover — dopamine payoff */
        'card-hover':
          '0 0 0 1px rgba(225,43,43,0.22), 0 22px 48px -12px rgba(225,43,43,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
        header: '0 1px 0 rgba(255,255,255,0.04), 0 4px 16px -4px rgba(0,0,0,0.4)',
        glow: '0 0 40px -8px rgba(225,43,43,0.55)',
        'glow-sm': '0 0 20px -4px rgba(225,43,43,0.40)',
      },
      backgroundImage: {
        /** Midnight with subtle red radial hints in corners */
        'mesh-page':
          'radial-gradient(ellipse 130% 90% at 100% -20%, rgba(225,43,43,0.07) 0%, transparent 55%), radial-gradient(ellipse 80% 60% at -5% 110%, rgba(225,43,43,0.05) 0%, transparent 50%)',
      },
      keyframes: {
        'shimmer-red': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px -4px rgba(225,43,43,0.35)' },
          '50%': { boxShadow: '0 0 40px -4px rgba(225,43,43,0.60)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'counter-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'shimmer-red': 'shimmer-red 3.5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        'counter-up': 'counter-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}

export default config
