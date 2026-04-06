'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '../ui/Button'

export function OverviewFetchError() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col items-start gap-8 py-10 sm:py-14 max-w-xl">
      <section
        aria-labelledby="overview-error-heading"
        aria-describedby="overview-error-body"
        aria-live="polite"
        aria-busy={pending}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Connection</p>
          <h1
            id="overview-error-heading"
            className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 leading-tight"
          >
            We could not load your overview
          </h1>
          <p id="overview-error-body" className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
            Your deals are not gone — we could not reach the server. Check your connection, confirm the API is
            running, then try again.
          </p>
        </div>
      </section>
      <Button
        type="button"
        variant="primary"
        loading={pending}
        onClick={() => {
          startTransition(() => {
            router.refresh()
          })
        }}
      >
        Try again
      </Button>
    </div>
  )
}
