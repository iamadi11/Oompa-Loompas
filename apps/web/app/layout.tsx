import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APP_SHORT_NAME,
  APP_THEME_COLOR_HEX,
} from '@/lib/product-meta'
import { BonesRegistryMount } from '@/components/boneyard/BonesRegistryMount'
import { SerwistRegister } from '@/components/pwa/SerwistRegister'
import { AppToaster } from '@/components/ui/AppToaster'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  applicationName: APP_SHORT_NAME,
  title: {
    default: APP_DISPLAY_NAME,
    template: `%s · ${APP_SHORT_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DISPLAY_NAME,
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: APP_THEME_COLOR_HEX,
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
      <body className="min-h-screen scroll-pt-28 antialiased font-sans bg-mesh-page bg-canvas text-stone-900">
        <SerwistRegister>
          <BonesRegistryMount />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-gold-soft focus:ring-offset-2 focus:ring-offset-canvas"
          >
            Skip to main content
          </a>
          <AppToaster />
          {children}
        </SerwistRegister>
      </body>
    </html>
  )
}
