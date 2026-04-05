import type { MetadataRoute } from 'next'

export function buildWebManifest(): MetadataRoute.Manifest {
  return {
    name: 'Creator Revenue Intelligence',
    short_name: 'Revenue',
    description:
      'Deal tracking, payments, and revenue intelligence for creators — your personal business operator.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#f9fafb',
    theme_color: '#111827',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
