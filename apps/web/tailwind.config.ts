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
        /** Warm page field — avoids cold gray-50 “template” feel */
        canvas: {
          DEFAULT: '#e9e4d9',
          muted: '#e2dcd0',
        },
        /** Cards / panels */
        surface: {
          DEFAULT: '#f7f5f0',
          raised: '#fdfcfa',
        },
        /** Hairlines and dividers */
        line: {
          DEFAULT: '#d4cdc0',
          strong: '#b8afa0',
        },
        /**
         * Primary accent: deep pine (trust, money-adjacent).
         * Chosen to avoid overused sky/violet SaaS defaults.
         */
        brand: {
          50: '#f0f6f4',
          100: '#dcebe6',
          200: '#b9d4ca',
          300: '#8eb5a7',
          400: '#5c8f7f',
          500: '#467a6b',
          600: '#386456',
          700: '#2e5247',
          800: '#27433b',
          900: '#1f3832',
        },
      },
      ringOffsetColor: {
        canvas: '#e9e4d9',
      },
      boxShadow: {
        card: '0 1px 0 rgba(28, 25, 23, 0.05), 0 12px 32px -8px rgba(28, 25, 23, 0.08)',
        'card-hover':
          '0 1px 0 rgba(28, 25, 23, 0.06), 0 20px 40px -12px rgba(31, 56, 50, 0.14)',
        header: '0 1px 0 rgba(28, 25, 23, 0.06)',
      },
      backgroundImage: {
        'mesh-page':
          'radial-gradient(ellipse 120% 80% at 100% -20%, rgba(70, 122, 107, 0.09) 0%, transparent 55%), radial-gradient(ellipse 90% 70% at -10% 110%, rgba(180, 140, 90, 0.06) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}

export default config
