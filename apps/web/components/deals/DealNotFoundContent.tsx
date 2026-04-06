import Link from 'next/link'

/**
 * Shared copy for a missing or inaccessible deal. Rendered from the deal detail
 * page when the API returns no deal, instead of calling `notFound()`, to avoid
 * a Next.js 14 dev false-positive that mounts the error overlay (“No default
 * component was found for a parallel route…”, vercel/next.js#75310).
 */
export function DealNotFoundContent() {
  return (
    <div className="flex flex-col items-start gap-5 py-12 max-w-md">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900">Deal not found</h1>
      <p className="text-stone-600 leading-relaxed">This deal doesn&apos;t exist or may have been deleted.</p>
      <Link
        href="/deals"
        className="text-sm font-semibold text-brand-800 hover:text-brand-900 underline underline-offset-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        Back to deals
      </Link>
    </div>
  )
}
