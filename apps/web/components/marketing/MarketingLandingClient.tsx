'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-motion'
import { APP_DISPLAY_NAME, APP_TAGLINE } from '@/lib/product-meta'

gsap.registerPlugin(ScrollTrigger)

const ctaClass =
  'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

export function MarketingLandingClient() {
  const container = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [mounted, setMounted] = useState(false)

  // Use a secondary mount gate to ensure GSAP only runs after hydration is complete
  useEffect(() => {
    setMounted(true)
  }, [])

  useGSAP(
    () => {
      if (!mounted || prefersReduced || !container.current) return

      const tl = gsap.timeline({ 
        defaults: { ease: 'expo.out', duration: 0.8 } 
      })
      
      tl.fromTo('header', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .fromTo('.hero-tagline', { y: 12, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.4')
        .fromTo('.hero-title', { y: 16, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.6')
        .fromTo('.hero-p', { y: 16, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.6')
        .fromTo('.hero-actions', { y: 16, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.5')

      // Scroll animations
      gsap.fromTo('.how-heading', 
        { y: 20, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.how-heading',
            start: 'top 90%',
            once: true,
          },
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        }
      )

      gsap.fromTo('.feature-card',
        { y: 24, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.feature-grid',
            start: 'top 85%',
            once: true,
          },
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power2.out',
        }
      )
    },
    { dependencies: [mounted, prefersReduced], scope: container }
  )

  return (
    <div ref={container} className="min-h-screen flex flex-col">
      <header
        className="border-b border-line/70 bg-surface-raised/90 backdrop-blur-md shadow-header"
        style={{ opacity: mounted && !prefersReduced ? 0 : 1 }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4 text-left">
          <span className="font-display text-xl font-semibold tracking-tight text-stone-900">
            {APP_DISPLAY_NAME}
          </span>
          <Link
            href="/login"
            className={`${ctaClass} border border-line/90 bg-surface-raised text-stone-800 hover:bg-canvas`}
          >
            Log in
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 text-left">
          <p
            className="hero-tagline text-xs font-semibold uppercase tracking-[0.22em] text-brand-800/90 mb-5"
            style={{ opacity: mounted && !prefersReduced ? 0 : 1 }}
          >
            {APP_TAGLINE}
          </p>
          <h1
            className="hero-title font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-semibold tracking-tight text-stone-900 leading-[1.12] text-balance max-w-3xl"
            style={{ opacity: mounted && !prefersReduced ? 0 : 1 }}
          >
            Know what to collect, deliver, and follow up — before income leaks.
          </h1>
          <p
            className="hero-p mt-6 text-lg sm:text-xl text-stone-600 leading-relaxed max-w-2xl text-pretty"
            style={{ opacity: mounted && !prefersReduced ? 0 : 1 }}
          >
            One calm workspace for deals, payment milestones, and deliverables. Built for creators
            who run a studio, not a spreadsheet.
          </p>
          <div
            className="hero-actions mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4"
            style={{ opacity: mounted && !prefersReduced ? 0 : 1 }}
          >
            <div className="btn-wrapper">
              <Link
                href="/login"
                className={`${ctaClass} bg-brand-700 text-white border border-brand-800/25 shadow-sm hover:bg-brand-800 transition-transform active:scale-95 hover:scale-[1.02]`}
              >
                Open your workspace
              </Link>
            </div>
            <Link
              href="#how-it-works"
              className={`${ctaClass} text-stone-700 hover:text-stone-900 border border-transparent`}
            >
              How it works
            </Link>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-line/60 bg-surface-raised/50 py-16 sm:py-20"
          aria-labelledby="how-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <h2
              id="how-heading"
              className="how-heading font-display text-2xl sm:text-3xl font-semibold text-stone-900 text-balance"
              style={{ opacity: mounted && !prefersReduced ? 0 : 1 }}
            >
              Outcome-first, not activity-first
            </h2>
            <ul className="feature-grid mt-10 grid gap-8 sm:grid-cols-3">
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
              ].map((item) => (
                <li
                  key={item.title}
                  className="feature-card space-y-2"
                  style={{ opacity: mounted && !prefersReduced ? 0 : 1 }}
                >
                  <h3 className="text-sm font-semibold text-stone-900">{item.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{item.body}</p>
                </li>
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
