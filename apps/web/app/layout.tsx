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
  themeColor: '#1f3832',
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
      <body className="min-h-screen antialiased font-sans bg-mesh-page bg-canvas text-stone-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-canvas"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
