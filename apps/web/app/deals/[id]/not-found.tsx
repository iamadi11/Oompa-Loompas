import Link from 'next/link'

export default function DealNotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Deal not found</h1>
      <p className="text-gray-500">This deal doesn&apos;t exist or may have been deleted.</p>
      <Link
        href="/deals"
        className="text-sm font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2"
      >
        Back to deals
      </Link>
    </div>
  )
}
