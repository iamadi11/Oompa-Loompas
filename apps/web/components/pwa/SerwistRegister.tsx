'use client'

import type { ReactNode } from 'react'
import { SerwistProvider } from '@serwist/turbopack/react'

export function SerwistRegister({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={process.env.NODE_ENV !== 'production'}
      reloadOnOnline
    >
      {children}
    </SerwistProvider>
  )
}
