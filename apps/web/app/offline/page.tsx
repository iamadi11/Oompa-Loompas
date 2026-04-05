import Link from 'next/link'

export const metadata = {
  title: 'Offline',
  description: 'You are offline. Reconnect to manage deals and payments.',
}

export default function OfflinePage() {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900">
        You are offline
      </h1>
      <p className="mt-4 text-sm text-gray-600 leading-relaxed">
        Deals, payments, and balances need an internet connection. Reconnect to see current numbers
        and take action.
      </p>
      <p className="mt-6">
        <Link
          href="/"
          className="text-sm font-medium text-gray-900 underline underline-offset-4 decoration-gray-400 transition-colors duration-150 motion-reduce:transition-none hover:decoration-gray-900"
        >
          Try home
        </Link>
      </p>
    </div>
  )
}
