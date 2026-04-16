/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from '@serwist/turbopack/worker'
import type { PrecacheEntry, RouteMatchCallback, SerwistGlobalConfig } from 'serwist'
import { NetworkOnly, Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

/** Revenue API must never be served from SW cache (network truth when online). */
const apiV1NetworkOnly: RouteMatchCallback = ({ sameOrigin, url }) =>
  sameOrigin && url.pathname.startsWith('/api/v1')

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: apiV1NetworkOnly,
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document'
        },
      },
    ],
  },
})

serwist.addEventListeners()

self.addEventListener('push', (event) => {
  if (event.data) {
    let data
    try {
      data = event.data.json()
    } catch (e) {
      data = { title: 'Notification', body: event.data.text() }
    }

    const title = data.title || 'Attention Required'
    const options = {
      body: data.body || 'You have new updates related to your deals.',
      icon: data.icon || '/icon512_maskable.png',
      badge: data.badge || '/icon512_maskable.png',
      data: data.url || '/',
    }

    event.waitUntil(self.registration.showNotification(title, options))
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const urlToOpen = (event.notification.data as string) || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          ;(client as WindowClient).navigate(urlToOpen)
          return (client as WindowClient).focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    }),
  )
})
