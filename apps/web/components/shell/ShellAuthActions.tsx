'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Roles, type AuthUser } from '@oompa/types'
import { api } from '@/lib/api'

const actionLink =
  'text-sm font-semibold text-stone-600 hover:text-stone-900 rounded-md px-3 py-2 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

type Props = {
  className?: string
  variant?: 'inline' | 'stacked'
  onNavigate?: () => void
}

export function ShellAuthActions({ className = '', variant = 'inline', onNavigate }: Props) {
  const [me, setMe] = useState<AuthUser | null | undefined>(undefined)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { data } = await api.getMe()
        if (!cancelled) setMe(data)
      } catch {
        if (!cancelled) setMe(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function logout() {
    setLoggingOut(true)
    try {
      await api.logout()
    } catch {
      // Still navigate — cookie may be cleared server-side
    } finally {
      setLoggingOut(false)
      onNavigate?.()
      // Full navigation so Next proxy re-reads cookies (client transition can leave stale session in some embeds).
      window.location.assign('/login')
    }
  }

  if (me === undefined) {
    return (
      <span
        className={`inline-block h-9 w-16 rounded-md bg-surface-raised/50 animate-pulse ${className}`}
        aria-hidden
      />
    )
  }

  if (me === null) {
    return null
  }

  const isAdmin = me.roles.includes(Roles.ADMIN)
  const flex =
    variant === 'stacked'
      ? 'flex flex-col items-stretch gap-0.5'
      : 'flex flex-row items-center gap-1'

  return (
    <div className={`${flex} ${className}`}>
      {isAdmin ? (
        <Link href="/admin" className={actionLink} {...(onNavigate ? { onClick: onNavigate } : {})}>
          Admin
        </Link>
      ) : null}
      <button
        type="button"
        className={`${actionLink} text-left disabled:opacity-50`}
        onClick={() => void logout()}
        disabled={loggingOut}
      >
        {loggingOut ? 'Signing out…' : 'Log out'}
      </button>
    </div>
  )
}
