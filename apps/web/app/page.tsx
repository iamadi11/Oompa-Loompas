import type { Metadata } from 'next'
import { MarketingLandingClient } from '../components/marketing/MarketingLandingClient'

export const metadata: Metadata = {
  title: 'Turn creator outcomes into clear next actions',
}

export default function MarketingHomePage() {
  return <MarketingLandingClient />
}
