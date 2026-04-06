import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Turn creator revenue into clear next actions',
}

const ctaClass =
  'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line/70 bg-surface-raised/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
          <span className="font-display text-xl font-semibold tracking-tight text-stone-900">Revenue</span>
          <Link
            href="/login"
            className={`${ctaClass} border border-line/90 bg-surface-raised text-stone-800 hover:bg-canvas`}
          >
            Log in
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-800/90 mb-5">
            Creator Revenue Intelligence
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-semibold tracking-tight text-stone-900 leading-[1.12] text-balance max-w-3xl">
            Know what to collect, deliver, and follow up — before revenue leaks.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-stone-600 leading-relaxed max-w-2xl text-pretty">
            One calm workspace for deals, payment milestones, and deliverables. Built for creators who run a studio,
            not a spreadsheet.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/login"
              className={`${ctaClass} bg-brand-700 text-white border border-brand-800/25 shadow-sm hover:bg-brand-800`}
            >
              Open your workspace
            </Link>
            <a
              href="#how-it-works"
              className={`${ctaClass} text-stone-700 hover:text-stone-900 border border-transparent`}
            >
              How it works
            </a>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-line/60 bg-surface-raised/50 py-16 sm:py-20"
          aria-labelledby="how-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              id="how-heading"
              className="font-display text-2xl sm:text-3xl font-semibold text-stone-900 text-balance"
            >
              Outcome-first, not activity-first
            </h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-3">
              <li className="space-y-2">
                <h3 className="text-sm font-semibold text-stone-900">Capture commitments</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Record deal value, brands, and timelines so nothing informal stays invisible.
                </p>
              </li>
              <li className="space-y-2">
                <h3 className="text-sm font-semibold text-stone-900">See what needs you</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Overdue payments and deliverables surface in one attention queue — oldest risk first.
                </p>
              </li>
              <li className="space-y-2">
                <h3 className="text-sm font-semibold text-stone-900">Prove what was agreed</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Printable invoices per payment milestone, with clear status and amounts.
                </p>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-line/60 py-8 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4">Revenue — financial outcome tooling for creators.</div>
      </footer>
    </div>
  )
}
