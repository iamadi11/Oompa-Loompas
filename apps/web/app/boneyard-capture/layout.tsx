import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Boneyard capture',
  robots: { index: false, follow: false },
}

export default function BoneyardCaptureLayout({ children }: { children: React.ReactNode }) {
  return children
}
