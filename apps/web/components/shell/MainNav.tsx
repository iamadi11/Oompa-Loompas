'use client'

import { useRef, useMemo } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'
import { usePathname } from 'next/navigation'
import { isMainNavCurrent } from '@/lib/main-nav'
import { APP_DISPLAY_NAME } from '@/lib/product-meta'
import { ShellAuthActions } from './ShellAuthActions'

const linkBase =
  'relative rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

function linkClassName(current: boolean): string {
  return `${linkBase} px-3 py-2 text-sm font-medium ${
    current ? 'text-brand-600 font-semibold' : 'text-stone-500 hover:text-stone-900'
  }`
}

const NAV_KEYS = ['overview', 'attention', 'deals', 'settings'] as const

function NavLinks(props: { className?: string }) {
  const pathname = usePathname() ?? ''
  const { className = '' } = props
  const container = useRef<HTMLDivElement>(null)
  const indicator = useRef<HTMLSpanElement>(null)

  const activeIndex = useMemo(() => {
    return NAV_KEYS.findIndex((key) => isMainNavCurrent(pathname, key))
  }, [pathname])

  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (activeIndex === -1 || !indicator.current || !container.current) return

      const links = container.current.querySelectorAll('a')
      const target = links[activeIndex]
      if (!target) return

      const { offsetLeft, offsetWidth } = target

      gsap.to(indicator.current, {
        x: offsetLeft + 4, // inset-x-1 equivalent
        width: offsetWidth - 8,
        duration: reduced ? 0 : 0.4,
        ease: 'power3.out',
      })
    },
    { dependencies: [activeIndex, reduced], scope: container }
  )

  return (
    <div ref={container} className="relative flex items-center gap-1">
      {/* Active Indicator */}
      <span
        ref={indicator}
        className="absolute -bottom-px h-px bg-brand-600 pointer-events-none"
        style={{
          boxShadow: '0 0 8px 1px rgba(225,43,43,0.70)',
          opacity: activeIndex === -1 ? 0 : 1,
        }}
      />

      {NAV_KEYS.map((key) => {
        const href =
          key === 'overview'
            ? '/dashboard'
            : key === 'attention'
              ? '/attention'
              : key === 'deals'
                ? '/deals'
                : '/settings'
        const label =
          key === 'overview'
            ? 'Overview'
            : key === 'attention'
              ? 'Attention'
              : key === 'deals'
                ? 'Deals'
                : 'Settings'
        const current = isMainNavCurrent(pathname, key)
        return (
          <Link
            key={key}
            href={href}
            className={`${linkClassName(current)} ${className}`}
            aria-current={current ? 'page' : undefined}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}

export function BrandHomeLink() {
  const prefersReduced = usePrefersReducedMotion()
  const spanRef = useRef<HTMLSpanElement>(null)

  const { contextSafe } = useGSAP({ scope: spanRef })

  const onMouseEnter = contextSafe(() => {
    if (prefersReduced) return
    gsap.to(spanRef.current, { scale: 1.02, duration: 0.3, ease: 'power2.out' })
  })

  const onMouseLeave = contextSafe(() => {
    if (prefersReduced) return
    gsap.to(spanRef.current, { scale: 1, duration: 0.3, ease: 'power2.inOut' })
  })

  const onMouseDown = contextSafe(() => {
    if (prefersReduced) return
    gsap.to(spanRef.current, { scale: 0.97, duration: 0.1 })
  })

  const onMouseUp = contextSafe(() => {
    if (prefersReduced) return
    gsap.to(spanRef.current, { scale: 1.02, duration: 0.1 })
  })

  return (
    <Link
      href="/dashboard"
      className="font-display text-lg sm:text-xl font-semibold tracking-tight text-stone-900 transition-opacity duration-200 hover:opacity-90 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <span ref={spanRef} className="relative inline-block">
        {APP_DISPLAY_NAME}
        <span
          className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-brand-600/0 via-brand-600/70 to-brand-600/0"
          aria-hidden="true"
        />
      </span>
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
