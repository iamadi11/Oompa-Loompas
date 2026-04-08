/** @vitest-environment happy-dom */
import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatDate, relativeTime } from '@oompa/utils'
import { RelativeDueLabel } from './RelativeDueLabel'

describe('RelativeDueLabel', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('server string uses calendar fallback (effects do not run)', () => {
    vi.useFakeTimers({ now: new Date('2026-04-08T12:00:00.000Z') })
    const iso = '2024-06-01T00:00:00.000Z'
    const fallback = formatDate(iso, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    const html = renderToString(<RelativeDueLabel iso={iso} />)
    expect(html).toContain(fallback)
    vi.useRealTimers()
  })

  it('after mount shows relativeTime under a fixed clock', async () => {
    vi.useFakeTimers({ now: new Date('2026-04-08T12:00:00.000Z') })
    const iso = '2024-06-01T00:00:00.000Z'
    const relative = relativeTime(iso)

    render(<RelativeDueLabel iso={iso} />)
    await vi.runAllTimersAsync()

    expect(
      screen.getByText(new RegExp(relative.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))),
    ).toBeInTheDocument()
  })
})
