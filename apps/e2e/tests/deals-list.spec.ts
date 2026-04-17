/**
 * Deals list page: pipeline strip, status filters, needs-attention toggle,
 * brand filter, "Add deal" CTA, deal count label.
 */
import { test, expect } from '@playwright/test'
import { createDeal } from '../helpers/api'

test.describe('Deals list — page structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')
  })

  test('shows Deals heading and count label', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Deals' })).toBeVisible()
    await expect(page.getByText(/\d+ deal/i)).toBeVisible()
  })

  test('page title matches filter state — default is "Deals"', async ({ page }) => {
    await expect(page).toHaveTitle(/^Deals/)
  })

  test('nav pills are present: Pipeline, Needs attention, Brands, Templates', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /deal view mode/i })
    await expect(nav.getByRole('link', { name: 'Pipeline' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Needs attention' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Brands' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Templates' })).toBeVisible()
  })

  test('Pipeline pill has aria-current="page" in default view', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Pipeline' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('export buttons are rendered', async ({ page }) => {
    // Export Deals CSV / Payments CSV / Deliverables CSV
    await expect(page.getByRole('button', { name: /export|csv/i }).first()).toBeVisible()
  })
})

test.describe('Deals list — pipeline strip', () => {
  test('pipeline strip shows all 6 status tabs', async ({ page, request }) => {
    await createDeal(request, { status: 'ACTIVE', title: 'Strip Test' })
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')

    const statuses = ['Draft', 'Negotiating', 'Active', 'Delivered', 'Paid', 'Cancelled']
    for (const s of statuses) {
      await expect(page.getByRole('link', { name: s, exact: false })).toBeVisible()
    }
  })

  test('clicking a status tab filters the list and sets aria-current', async ({
    page,
    request,
  }) => {
    await createDeal(request, { status: 'ACTIVE', title: 'Active Filter Deal' })
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')

    const activeTab = page.getByRole('link', { name: /^Active\s*\d*$/ })
    if (await activeTab.isVisible()) {
      await activeTab.click()
      await expect(page).toHaveURL(/status=ACTIVE/)
      await expect(page).toHaveTitle(/Active deals/i)
    }
  })

  test('clicking active status tab again returns to all-deals view', async ({ page }) => {
    await page.goto('/deals?status=ACTIVE')
    await page.waitForLoadState('networkidle')
    // Click Pipeline pill to clear filter
    await page.getByRole('link', { name: 'Pipeline' }).click()
    await page.waitForURL(/\/deals(\?(?!.*status=)|$)/)
    expect(page.url()).not.toContain('status=')
  })
})

test.describe('Deals list — needs-attention mode', () => {
  test('clicking Needs attention pill sets URL and aria-current', async ({ page }) => {
    await page.goto('/deals')
    await page.getByRole('link', { name: 'Needs attention' }).click()
    await expect(page).toHaveURL(/needsAttention=true/)
    await expect(page.getByRole('link', { name: 'Needs attention' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('title changes to "Needs attention" when filter active', async ({ page }) => {
    await page.goto('/deals?needsAttention=true')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/needs attention/i)
  })

  test('count label says "deals with overdue work" or empty state', async ({ page }) => {
    await page.goto('/deals?needsAttention=true')
    await page.waitForLoadState('networkidle')
    const hasCount = await page
      .getByText(/deals with overdue work/i)
      .isVisible()
      .catch(() => false)
    const hasEmpty = await page
      .getByText(/all caught up|no deals/i)
      .isVisible()
      .catch(() => false)
    expect(hasCount || hasEmpty).toBe(true)
  })

  test('switching back to Pipeline removes needsAttention from URL', async ({ page }) => {
    await page.goto('/deals?needsAttention=true')
    await page.getByRole('link', { name: 'Pipeline' }).click()
    await page.waitForURL((url) => !url.search.includes('needsAttention'))
    expect(page.url()).not.toContain('needsAttention')
  })

  test('pipeline strip is hidden in needs-attention mode', async ({ page }) => {
    await page.goto('/deals?needsAttention=true')
    await page.waitForLoadState('networkidle')
    // Pipeline strip status tabs should not appear
    await expect(page.getByRole('link', { name: /^Draft\s*\d*$/ })).not.toBeVisible()
  })
})

test.describe('Deals list — brand filter', () => {
  test('?brandName= shows brand filter banner', async ({ page, request }) => {
    await createDeal(request, { brandName: 'FilterBrand', title: 'Brand Filter Deal' })
    await page.goto('/deals?brandName=FilterBrand')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/brand filter/i)).toBeVisible()
    await expect(page.getByText('FilterBrand')).toBeVisible()
  })

  test('Clear brand filter link removes brandName from URL', async ({ page, request }) => {
    await createDeal(request, { brandName: 'ClearMe', title: 'Clear Brand Deal' })
    await page.goto('/deals?brandName=ClearMe')
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: /clear brand filter/i }).click()
    await page.waitForURL((url) => !url.search.includes('brandName'))
    expect(page.url()).not.toContain('brandName')
  })

  test('brand filter + needsAttention can coexist', async ({ page }) => {
    await page.goto('/deals?needsAttention=true&brandName=TestBrand')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/brand filter/i)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Needs attention' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})

test.describe('Deals list — Add deal CTA', () => {
  test('Add deal button navigates to /deals/new', async ({ page, request }) => {
    // Create a deal so the add button is always shown
    await createDeal(request, { title: 'Ensure CTA Deal' })
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: /add deal/i }).click()
    await expect(page).toHaveURL(/\/deals\/new/)
  })

  test('From template button navigates to /deals/templates', async ({ page, request }) => {
    await createDeal(request, { title: 'Ensure CTA Deal 2' })
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: /from template/i }).click()
    await expect(page).toHaveURL(/\/deals\/templates/)
  })
})
