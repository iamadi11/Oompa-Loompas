/**
 * Responsive / mobile smoke tests — runs on the iPhone 13 project only.
 * Verifies that key workspace pages render correctly at mobile viewport.
 */
import { test, expect } from '@playwright/test'

const WORKSPACE_ROUTES = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'deals list', path: '/deals' },
  { name: 'attention', path: '/attention' },
  { name: 'settings', path: '/settings' },
]

test.describe('Responsive — mobile viewport smoke tests', () => {
  for (const { name, path } of WORKSPACE_ROUTES) {
    test(`${name} page renders without horizontal overflow`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      // Should stay on the page (no forced redirect away for auth — session is present)
      await expect(page).not.toHaveURL(/\/login/)

      // Page must not trigger horizontal scrollbar (content fits viewport width)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth, `${name} has horizontal overflow`).toBeLessThanOrEqual(clientWidth)
    })
  }

  test('bottom navigation is visible on mobile', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Bottom nav should be rendered and visible at mobile viewport
    const bottomNav = page.locator('nav').last()
    await expect(bottomNav).toBeVisible()
  })

  test('main header is visible and not clipped on mobile', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const header = page.locator('header').first()
    await expect(header).toBeVisible()
    const box = await header.boundingBox()
    expect(box, 'header bounding box should be defined').not.toBeNull()
    // Header should start at the top of the viewport
    expect(box!.y).toBeLessThanOrEqual(5)
  })

  test('deals list is scrollable and renders at least one item or empty state', async ({
    page,
  }) => {
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')
    // Either deal cards are present, or the empty-state message is shown
    const hasDeals = await page.locator('[data-testid="deal-card"]').count()
    const hasEmpty = await page.getByText(/no deals yet|empty portfolio/i).count()
    expect(hasDeals + hasEmpty, 'deals page should show deals or empty state').toBeGreaterThan(0)
  })
})
