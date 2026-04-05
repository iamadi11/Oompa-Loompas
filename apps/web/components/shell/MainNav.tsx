'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isMainNavCurrent } from '../../lib/main-nav'

const linkBase =
  'rounded-sm transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2'

function linkClassName(current: boolean): string {
  return `${linkBase} ${
    current ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'
  }`
}

export function MainNav() {
  const pathname = usePathname() ?? ''

  return (
    <nav className="flex gap-6 text-sm font-medium" aria-label="Main">
      <Link
        href="/attention"
        className={linkClassName(isMainNavCurrent(pathname, 'attention'))}
        aria-current={isMainNavCurrent(pathname, 'attention') ? 'page' : undefined}
      >
        Attention
      </Link>
      <Link
        href="/deals"
        className={linkClassName(isMainNavCurrent(pathname, 'deals'))}
        aria-current={isMainNavCurrent(pathname, 'deals') ? 'page' : undefined}
      >
        Deals
      </Link>
    </nav>
  )
}

export function BrandHomeLink() {
  const pathname = usePathname() ?? ''
  const current = isMainNavCurrent(pathname, 'home')
  return (
    <Link
      href="/"
      className="font-display text-lg font-semibold tracking-tight text-gray-900 transition-opacity duration-150 motion-reduce:transition-none hover:opacity-80 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      aria-current={current ? 'page' : undefined}
    >
      Revenue
    </Link>
  )
}
