import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col items-start gap-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Your revenue, under control.
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Track deals, monitor payments, and never miss a rupee.
        </p>
      </div>
      <Link
        href="/deals"
        className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        View my deals
      </Link>
    </div>
  )
}
