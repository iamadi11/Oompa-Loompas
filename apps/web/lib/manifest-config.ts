import type { MetadataRoute } from 'next'
import {
  APP_BACKGROUND_COLOR_HEX,
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APP_SHORT_NAME,
  APP_THEME_COLOR_HEX,
} from './product-meta'

export function buildWebManifest(): MetadataRoute.Manifest {
  return {
    name: APP_DISPLAY_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: APP_BACKGROUND_COLOR_HEX,
    theme_color: APP_THEME_COLOR_HEX,
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
