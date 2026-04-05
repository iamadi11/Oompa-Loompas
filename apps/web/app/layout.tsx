import type { Metadata, Viewport } from 'next'
import { Fraunces, Source_Sans_3 } from 'next/font/google'
import './globals.css'

const APP_NAME = 'Revenue'

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: 'Creator Revenue Intelligence',
    template: `%s · ${APP_NAME}`,
  },
  description:
    'Deal tracking, payments, and revenue intelligence for creators — your personal business operator.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Creator Revenue Intelligence',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen antialiased font-sans">
        <div className="min-h-screen flex flex-col">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-gray-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Skip to main content
          </a>
          <header className="border-b border-gray-200/90 bg-white/95 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <a
                href="/"
                className="font-display text-lg font-semibold tracking-tight text-gray-900 transition-opacity duration-150 motion-reduce:transition-none hover:opacity-80 focus-visible:rounded-sm"
              >
                Revenue
              </a>
              <nav className="flex gap-6 text-sm font-medium text-gray-600" aria-label="Main">
                <a
                  href="/deals"
                  className="rounded-sm transition-colors duration-150 motion-reduce:transition-none hover:text-gray-900"
                >
                  Deals
                </a>
              </nav>
            </div>
          </header>
          <main
            id="main-content"
            className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
