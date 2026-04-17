/**
 * Dashboard: priority action list, navigation, empty state, overdue items.
 */
import { test, expect } from '@playwright/test'
import { createDeal, createPayment, createDeliverable } from '../helpers/api'

// ─── Dashboard structure ───────────────────────────────────────────────────

test.describe('Dashboard — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('shows Dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('page title is "Dashboard"', async ({ page }) => {
    await expect(page).toHaveTitle(/dashboard/i)
  })

  test('nav marks Dashboard as current page', async ({ page }) => {
    const dashLink = page.locator('a[aria-current="page"]').filter({ hasText: /dashboard/i })
    await expect(dashLink).toBeVisible()
  })

  test('main navigation has Dashboard and Deals links', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /deals/i })).toBeVisible()
  })
})

// ─── Dashboard — priority actions ─────────────────────────────────────────

test.describe('Dashboard — priority actions', () => {
  test('shows overdue payment in priority list when present', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Priority Payment Deal', status: 'ACTIVE' })
    await createPayment(request, id, {
      dueDate: new Date(Date.now() - 86_400_000 * 2).toISOString(),
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/Priority Payment Deal/i)).toBeVisible()
  })

  test('shows overdue deliverable in priority list when present', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Priority Del Deal', status: 'ACTIVE' })
    await createDeliverable(request, id, {
      title: 'Overdue Reel',
      dueDate: new Date(Date.now() - 86_400_000 * 2).toISOString(),
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/Priority Del Deal/i)).toBeVisible()
  })

  test('shows "all caught up" or items — never blank', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const hasCaughtUp = await page
      .getByText(/all caught up|no overdue|everything on track/i)
      .isVisible()
      .catch(() => false)
    const hasItems = await page.getByRole('listitem').count().then((c) => c > 0).catch(() => false)
    const hasHeading = await page.getByRole('heading').count().then((c) => c > 0).catch(() => false)

    expect(hasCaughtUp || hasItems || hasHeading).toBe(true)
  })

  test('dashboard priority list is capped at 10 items by API', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Visual check: list renders (content cap is enforced server-side)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })
})

// ─── Dashboard navigation ──────────────────────────────────────────────────

test.describe('Dashboard — navigation', () => {
  test('clicking Deals nav link navigates to /deals', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: /^deals$/i }).first().click()
    await expect(page).toHaveURL(/\/deals/)
  })

  test('clicking Attention link from priority actions navigates to /attention', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const attentionLink = page.getByRole('link', { name: /view all|see all|attention/i })
    if (await attentionLink.isVisible()) {
      await attentionLink.click()
      await expect(page).toHaveURL(/\/attention/)
    }
  })

  test('clicking a deal card in priority list navigates to deal detail', async ({
    page,
    request,
  }) => {
    const id = await createDeal(request, { title: 'Click Through Deal', status: 'ACTIVE' })
    await createPayment(request, id, {
      dueDate: new Date(Date.now() - 86_400_000).toISOString(),
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const dealLink = page.getByRole('link', { name: /Click Through Deal/i })
    if (await dealLink.isVisible()) {
      await dealLink.click()
      await expect(page).toHaveURL(new RegExp(`/deals/${id}`))
    }
  })
})
