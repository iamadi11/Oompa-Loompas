import Link from 'next/link'

export const metadata = {
  title: 'Offline',
  description: 'You are offline. Reconnect to manage deals and payments.',
}

export default function OfflinePage() {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
        You are offline
      </h1>
      <p className="mt-4 text-sm text-stone-600 leading-relaxed">
        Deals, payments, and balances need an internet connection. Reconnect to see current numbers
        and take action.
      </p>
      <p className="mt-8">
        <Link
          href="/"
          className="text-sm font-semibold text-stone-900 underline underline-offset-4 decoration-line-strong/80 transition-colors duration-200 motion-reduce:transition-none hover:decoration-brand-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          Try home
        </Link>
      </p>
    </div>
  )
}
