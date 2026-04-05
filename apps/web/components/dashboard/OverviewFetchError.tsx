'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '../ui/Button'

export function OverviewFetchError() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col items-start gap-6 py-12">
      <section
        aria-labelledby="overview-error-heading"
        aria-describedby="overview-error-body"
        aria-live="polite"
        aria-busy={pending}
      >
        <div>
          <h1
            id="overview-error-heading"
            className="text-3xl font-bold tracking-tight text-gray-900"
          >
            We could not load your overview
          </h1>
          <p id="overview-error-body" className="mt-2 text-lg text-gray-600">
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
