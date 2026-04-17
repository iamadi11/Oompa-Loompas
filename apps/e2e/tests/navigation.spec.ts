/**
 * Global navigation, offline page, responsive layout.
 */
import { test, expect } from '@playwright/test'

// ─── Main nav links ────────────────────────────────────────────────────────

test.describe('Main navigation', () => {
  const routes: Array<{ name: string; url: RegExp }> = [
    { name: 'Overview', url: /\/dashboard/ },
    { name: 'Deals', url: /\/deals/ },
  ]

  for (const { name, url } of routes) {
    test(`clicking ${name} nav link navigates to correct route`, async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      await page.getByRole('navigation').getByRole('link', { name, exact: true }).first().click()
      await expect(page).toHaveURL(url)
    })
  }

  test('active nav link has aria-current="page"', async ({ page }) => {
    for (const { url } of routes) {
      await page.goto(url.toString().replace(/[/\\^$*+?.()|[\]{}]/g, ''))
      // Check that some link has aria-current
      await expect(page.locator('[aria-current="page"]').first()).toBeVisible()
    }
  })

  test('nav links do not return 5xx on GET', async ({ page, request }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const links = await page.getByRole('navigation').first().getByRole('link').all()
    for (const link of links) {
      const href = await link.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http')) continue
      const res = await request.get(href).catch(() => null)
      if (res) expect(res.status(), `${href} returned ${res.status()}`).toBeLessThan(500)
    }
  })
})

// ─── Offline page ─────────────────────────────────────────────────────────

test.describe('Offline page — /offline', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('renders without auth', async ({ page }) => {
    await page.goto('/offline')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/offline|connection|internet/i).first()).toBeVisible()
  })

  test('page does not redirect to login', async ({ page }) => {
    await page.goto('/offline')
    await expect(page).not.toHaveURL(/\/login/)
  })
})

// ─── Home / landing page ───────────────────────────────────────────────────

test.describe('Home / landing — /', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('landing page is accessible without auth', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('has link to /login', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('link', { name: /sign in|log in|get started/i })).toBeVisible()
  })
})

// ─── Responsive layout ─────────────────────────────────────────────────────

test.describe('Responsive layout — mobile (375px)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('deals page renders on 375px viewport', async ({ page }) => {
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /deals/i })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pipeline' })).toBeVisible()
  })

  test('dashboard renders on 375px viewport', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()
  })

  test('deal detail renders on 375px viewport', async ({ page, request }) => {
    const { createDeal } = await import('../helpers/api')
    const id = await createDeal(request, { title: 'Mobile Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Mobile Deal' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /payments/i }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: /deliverables/i }).first()).toBeVisible()
  })

  test('templates page renders on 375px viewport', async ({ page }) => {
    await page.goto('/deals/templates')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /templates/i })).toBeVisible()
  })

  test('brands page renders on 375px viewport', async ({ page }) => {
    await page.goto('/deals/brands')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /brands/i })).toBeVisible()
  })
})
