'use client'

import { useEffect, useState } from 'react'
import { formatDate, relativeTime } from '@oompa/utils'

const FALLBACK_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

type Props = {
  /** Due instant as ISO string (API / dashboard). */
  iso: string
}

/**
 * Renders " · due …" using a calendar label until mount, then swaps to `relativeTime` so SSR and the
 * first client paint match (both use `formatDate`); `relativeTime` uses `Date.now()` and must not run
 * during SSR for the same string.
 */
export function RelativeDueLabel({ iso }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Mount gate: SSR + first client paint use formatDate; then relativeTime (uses Date.now()).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-shot client upgrade
    setMounted(true)
  }, [])

  const label = mounted ? relativeTime(iso) : formatDate(iso, FALLBACK_FORMAT)

  return (
    <span className="text-stone-500">
      {' · due '}
      {label}
    </span>
  )
}
