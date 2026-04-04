import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Creator Revenue Intelligence',
  description: 'Your personal business operator — deal tracking, payments, and revenue intelligence for creators.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-gray-200 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <a href="/" className="text-lg font-semibold tracking-tight text-gray-900">
                Revenue
              </a>
              <nav className="flex gap-6 text-sm font-medium text-gray-600">
                <a href="/deals" className="hover:text-gray-900 transition-colors">
                  Deals
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
