'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-start gap-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="text-gray-500 text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="text-sm font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2"
      >
        Try again
      </button>
    </div>
  )
}
