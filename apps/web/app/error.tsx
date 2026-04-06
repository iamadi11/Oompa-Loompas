'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-start gap-5 py-12 max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-stone-900">Something went wrong</h1>
      <p className="text-stone-600 text-sm leading-relaxed">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="text-sm font-semibold text-brand-800 hover:text-brand-900 underline underline-offset-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        Try again
      </button>
    </div>
  )
}
