'use client'

import { useRef, useMemo } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { isMainNavCurrent } from '@/lib/main-nav'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'

interface NavItem {
  href: string
  label: string
  key: 'overview' | 'attention' | 'deals' | 'settings'
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    key: 'overview',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/attention',
    label: 'Attention',
    key: 'attention',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    href: '/deals',
    label: 'Deals',
    key: 'deals',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="12" y2="17" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    key: 'settings',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname() ?? ''
  const reduced = usePrefersReducedMotion()
  const container = useRef<HTMLUListElement>(null)
  const indicator = useRef<HTMLSpanElement>(null)

  const activeIndex = useMemo(() => {
    return NAV_ITEMS.findIndex((item) => isMainNavCurrent(pathname, item.key))
  }, [pathname])

  useGSAP(
    () => {
      if (activeIndex === -1 || !indicator.current || !container.current) return

      const items = container.current.querySelectorAll('li')
      const target = items[activeIndex]
      if (!target) return

      const { offsetLeft, offsetWidth } = target

      // Initial state to avoid jump? No, it's better to let it animate.
      gsap.to(indicator.current, {
        x: offsetLeft + 12, // inset-x-3 equivalent
        width: offsetWidth - 24,
        duration: reduced ? 0 : 0.4,
        ease: 'power3.out',
      })
    },
    { dependencies: [activeIndex, reduced], scope: container },
  )

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-canvas/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <ul ref={container} className="relative flex items-stretch h-[60px]" role="list">
        {/* Animated indicator */}
        <span
          ref={indicator}
          className="absolute top-0 h-[2px] rounded-b-full bg-brand-600 pointer-events-none"
          style={{
            boxShadow: '0 0 12px 2px rgba(225,43,43,0.55)',
            opacity: activeIndex === -1 ? 0 : 1,
          }}
        />

        {NAV_ITEMS.map((item) => {
          const active = isMainNavCurrent(pathname, item.key)
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href as Route}
                aria-current={active ? 'page' : undefined}
                className="relative flex flex-col items-center justify-center gap-1 h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-inset"
              >
                <span
                  className={`transition-colors duration-150 ${
                    active ? 'text-brand-600' : 'text-stone-500'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-colors duration-150 ${
                    active ? 'text-brand-600' : 'text-stone-500'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
