'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { useAllowEntranceMotion, usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'
import { APP_DISPLAY_NAME, APP_TAGLINE } from '@/lib/product-meta'

const ctaClass =
  'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

function delayStep(allowEntrance: boolean, step: number) {
  return allowEntrance ? step * 0.09 : 0
}

export function MarketingLandingClient() {
  const allowEntrance = useAllowEntranceMotion()
  const prefersReduced = usePrefersReducedMotion()

  return (
    <div className="min-h-screen flex flex-col">
      <motion.header
        className="border-b border-line/70 bg-surface-raised/90 backdrop-blur-md shadow-header"
        initial={allowEntrance ? { opacity: 0, y: -12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
          <span className="font-display text-xl font-semibold tracking-tight text-stone-900">{APP_DISPLAY_NAME}</span>
          <Link
            href="/login"
            className={`${ctaClass} border border-line/90 bg-surface-raised text-stone-800 hover:bg-canvas`}
          >
            Log in
          </Link>
        </div>
      </motion.header>

      <main id="main-content" className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-800/90 mb-5"
            initial={allowEntrance ? { opacity: 0, y: 14 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: delayStep(allowEntrance, 0) }}
          >
            {APP_TAGLINE}
          </motion.p>
          <motion.h1
            className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-semibold tracking-tight text-stone-900 leading-[1.12] text-balance max-w-3xl"
            initial={allowEntrance ? { opacity: 0, y: 24 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: delayStep(allowEntrance, 1) }}
          >
            Know what to collect, deliver, and follow up — before income leaks.
          </motion.h1>
          <motion.p
            className="mt-6 text-lg sm:text-xl text-stone-600 leading-relaxed max-w-2xl text-pretty"
            initial={allowEntrance ? { opacity: 0, y: 18 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delayStep(allowEntrance, 2) }}
          >
            One calm workspace for deals, payment milestones, and deliverables. Built for creators who run a studio,
            not a spreadsheet.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4"
            initial={allowEntrance ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, delay: delayStep(allowEntrance, 3) }}
          >
            <motion.div
              {...(!prefersReduced ? { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } } : {})}
            >
              <Link
                href="/login"
                className={`${ctaClass} bg-brand-700 text-white border border-brand-800/25 shadow-sm hover:bg-brand-800`}
              >
                Open your workspace
              </Link>
            </motion.div>
            <Link
              href="#how-it-works"
              className={`${ctaClass} text-stone-700 hover:text-stone-900 border border-transparent`}
            >
              How it works
            </Link>
          </motion.div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-line/60 bg-surface-raised/50 py-16 sm:py-20"
          aria-labelledby="how-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              id="how-heading"
              className="font-display text-2xl sm:text-3xl font-semibold text-stone-900 text-balance"
              initial={allowEntrance ? { opacity: 0, y: 16 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
            >
              Outcome-first, not activity-first
            </motion.h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                {
                  title: 'Capture commitments',
                  body: 'Record deal value, brands, and timelines so nothing informal stays invisible.',
                },
                {
                  title: 'See what needs you',
                  body: 'Overdue payments and deliverables surface in one attention queue — oldest risk first.',
                },
                {
                  title: 'Prove what was agreed',
                  body: 'Printable invoices per payment milestone, with clear status and amounts.',
                },
              ].map((item, idx) => (
                <motion.li
                  key={item.title}
                  className="space-y-2"
                  initial={allowEntrance ? { opacity: 0, y: 20 } : false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: allowEntrance ? idx * 0.12 : 0 }}
                >
                  <h3 className="text-sm font-semibold text-stone-900">{item.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{item.body}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-line/60 py-8 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4">
          {APP_DISPLAY_NAME} — financial outcome tooling for creators.
        </div>
      </footer>
    </div>
  )
}
