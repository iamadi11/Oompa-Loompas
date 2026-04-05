'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '../ui/Button'

export function OverviewFetchError() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col items-start gap-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">We could not load your overview</h1>
        <p className="mt-2 text-lg text-gray-600">
          Your deals are not gone — we could not reach the server. Check your connection, confirm the API is
          running, then try again.
        </p>
      </div>
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
