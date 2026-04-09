'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'
import { usePathname } from 'next/navigation'
import { isMainNavCurrent } from '@/lib/main-nav'
import { APP_DISPLAY_NAME } from '@/lib/product-meta'
import { ShellAuthActions } from './ShellAuthActions'

const linkBase =
  'relative rounded-md transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

function linkClassName(current: boolean): string {
  return `${linkBase} px-3 py-2 text-sm font-medium ${
    current ? 'text-brand-600 font-semibold' : 'text-stone-500 hover:text-stone-900'
  }`
}

function NavLinks(props: { className?: string }) {
  const pathname = usePathname() ?? ''
  const { className = '' } = props

  return (
    <>
      {(['overview', 'attention', 'deals'] as const).map((key) => {
        const href = key === 'overview' ? '/dashboard' : key === 'attention' ? '/attention' : '/deals'
        const label = key === 'overview' ? 'Overview' : key === 'attention' ? 'Attention' : 'Deals'
        const current = isMainNavCurrent(pathname, key)
        return (
          <Link
            key={key}
            href={href}
            className={`${linkClassName(current)} ${className}`}
            aria-current={current ? 'page' : undefined}
          >
            {label}
            {current && (
              <span
                className="absolute inset-x-1 -bottom-px h-px bg-brand-600"
                style={{ boxShadow: '0 0 8px 1px rgba(225,43,43,0.70)' }}
                aria-hidden="true"
              />
            )}
          </Link>
        )
      })}
    </>
  )
}

export function BrandHomeLink() {
  const prefersReduced = usePrefersReducedMotion()
  return (
    <Link
      href="/dashboard"
      className="font-display text-lg sm:text-xl font-semibold tracking-tight text-stone-900 transition-opacity duration-200 motion-reduce:transition-none hover:opacity-90 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <motion.span
        className="relative inline-block"
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        {...(!prefersReduced ? { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 } } : {})}
      >
        {APP_DISPLAY_NAME}
        <span
          className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-brand-600/0 via-brand-600/70 to-brand-600/0"
          aria-hidden="true"
        />
      </motion.span>
    </Link>
  )
}

export function AppShellHeader() {
  return (
    <div className="flex items-center justify-between gap-3 py-3 sm:py-4">
      <BrandHomeLink />
      {/* Desktop nav — hidden on mobile (BottomNav handles mobile) */}
      <nav className="hidden md:flex items-center gap-1" aria-label="Main">
        <NavLinks />
        <ShellAuthActions className="ml-3 pl-3 border-l border-line/70" />
      </nav>
      {/* Mobile: only auth actions (sign out) — nav handled by BottomNav */}
      <div className="flex md:hidden">
        <ShellAuthActions />
      </div>
    </div>
  )
}
