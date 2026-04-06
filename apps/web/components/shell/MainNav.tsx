'use client'

import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import { usePathname } from 'next/navigation'
import { isMainNavCurrent } from '../../lib/main-nav'
import { ShellAuthActions } from './ShellAuthActions'

const linkBase =
  'rounded-md transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

function linkClassName(current: boolean): string {
  return `${linkBase} ${
    current
      ? 'text-stone-900 font-semibold bg-surface-raised/90 px-3 py-2 shadow-sm border border-line/80'
      : 'text-stone-600 hover:text-stone-900 px-3 py-2'
  }`
}

function NavLinks(props: { onNavigate?: () => void; className?: string }) {
  const pathname = usePathname() ?? ''
  const { onNavigate, className = '' } = props

  return (
    <>
      <Link
        href="/dashboard"
        className={`${linkClassName(isMainNavCurrent(pathname, 'overview'))} ${className}`}
        aria-current={isMainNavCurrent(pathname, 'overview') ? 'page' : undefined}
        {...(onNavigate ? { onClick: onNavigate } : {})}
      >
        Overview
      </Link>
      <Link
        href="/attention"
        className={`${linkClassName(isMainNavCurrent(pathname, 'attention'))} ${className}`}
        aria-current={isMainNavCurrent(pathname, 'attention') ? 'page' : undefined}
        {...(onNavigate ? { onClick: onNavigate } : {})}
      >
        Attention
      </Link>
      <Link
        href="/deals"
        className={`${linkClassName(isMainNavCurrent(pathname, 'deals'))} ${className}`}
        aria-current={isMainNavCurrent(pathname, 'deals') ? 'page' : undefined}
        {...(onNavigate ? { onClick: onNavigate } : {})}
      >
        Deals
      </Link>
    </>
  )
}

export function BrandHomeLink() {
  return (
    <Link
      href="/dashboard"
      className="font-display text-lg sm:text-xl font-semibold tracking-tight text-stone-900 transition-opacity duration-200 motion-reduce:transition-none hover:opacity-85 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <span className="relative">
        Revenue
        <span
          className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-brand-600/0 via-brand-600/50 to-brand-600/0 opacity-70"
          aria-hidden="true"
        />
      </span>
    </Link>
  )
}

/**
 * Sticky shell: desktop nav inline; compact screens get an explicit menu (no hover-only).
 */
export function AppShellHeader() {
  const pathname = usePathname() ?? ''
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 py-3 sm:py-4">
        <BrandHomeLink />
        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          <NavLinks />
          <ShellAuthActions className="ml-2 pl-2 border-l border-line/70" />
        </nav>
        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line/90 bg-surface-raised/80 text-stone-800 shadow-sm transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      <div
        id={menuId}
        hidden={!menuOpen}
        className={
          menuOpen
            ? 'md:hidden border-t border-line/70 bg-surface-raised/95 pb-4 pt-1 shadow-inner'
            : 'hidden'
        }
      >
        {menuOpen ? (
          <nav className="flex flex-col gap-0.5 pt-2" aria-label="Main">
            <NavLinks
              onNavigate={() => setMenuOpen(false)}
              className="!flex !w-full !justify-start"
            />
            <ShellAuthActions
              variant="stacked"
              onNavigate={() => setMenuOpen(false)}
              className="!flex !w-full !justify-start mt-2 pt-2 border-t border-line/70"
            />
          </nav>
        ) : null}
      </div>
    </div>
  )
}
