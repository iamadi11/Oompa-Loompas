import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const VARIANT_STYLES = {
  primary:
    'bg-brand-700 text-white shadow-sm hover:bg-brand-800 focus-visible:ring-brand-600 disabled:bg-brand-300 border border-brand-800/20',
  secondary:
    'bg-surface-raised text-stone-800 border border-line-strong/90 hover:bg-surface focus-visible:ring-stone-400 shadow-sm',
  danger:
    'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600 disabled:bg-red-300 shadow-sm',
  ghost:
    'text-stone-600 hover:text-stone-900 hover:bg-surface-raised/80 focus-visible:ring-stone-400',
}

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight
        transition-colors duration-200 motion-reduce:transition-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas
        disabled:cursor-not-allowed disabled:opacity-60
        ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}
      `.trim()}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
