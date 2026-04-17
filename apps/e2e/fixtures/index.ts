import { test as base, expect, type Page, type APIRequestContext } from '@playwright/test'

export { expect }

interface ApiHelpers {
  /** POST to the API and return the parsed JSON body */
  apiPost: (path: string, body: unknown) => Promise<unknown>
  /** GET from the API and return the parsed JSON body */
  apiGet: (path: string) => Promise<unknown>
}

interface AppFixtures {
  api: ApiHelpers
  /** Navigate and wait for the page to be idle (no network requests) */
  gotoAndWait: (path: string) => Promise<void>
}

const API_BASE = process.env['E2E_API_URL'] ?? 'http://localhost:3001'

export const test = base.extend<AppFixtures>({
  api: async ({ request }, use) => {
    const helpers: ApiHelpers = {
      async apiPost(path, body) {
        const res = await request.post(`${API_BASE}${path}`, { data: body })
        return res.json()
      },
      async apiGet(path) {
        const res = await request.get(`${API_BASE}${path}`)
        return res.json()
      },
    }
    await use(helpers)
  },

  gotoAndWait: async ({ page }, use) => {
    await use(async (path: string) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
    })
  },
})
