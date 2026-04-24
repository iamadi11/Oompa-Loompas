/**
 * Payment reconciliation: /reconcile page
 * Upload/paste bank CSV → match to pending payments → mark received.
 */
import { test, expect } from '@playwright/test'
import { createDeal, createPayment, deleteDeal } from '../helpers/api'

const SAMPLE_CSV = (amount: number, brandName: string) =>
  `Date,Narration,Debit,Credit,Balance\n19/04/2026,UPI/${brandName},,${amount},100000`

// Track created deals for cleanup — prevents DB accumulation from breaking take:200 limit.
const createdDealIds: string[] = []
test.afterEach(async ({ request }) => {
  for (const id of createdDealIds.splice(0)) {
    await deleteDeal(request, id)
  }
})

async function createTestDeal(
  request: import('@playwright/test').APIRequestContext,
  overrides: Record<string, unknown> = {},
): Promise<string> {
  const id = await createDeal(request, overrides)
  createdDealIds.push(id)
  return id
}

// ─── Page structure ────────────────────────────────────────────────────────

test.describe('/reconcile — page structure', () => {
  test('shows "Mark payments as received" heading', async ({ page }) => {
    await page.goto('/reconcile')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /mark payments as received/i })).toBeVisible()
  })

  test('page title contains Reconcile', async ({ page }) => {
    await page.goto('/reconcile')
    await expect(page).toHaveTitle(/reconcile/i)
  })

  test('shows Back link to /attention', async ({ page }) => {
    await page.goto('/reconcile')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('link', { name: /back/i })).toBeVisible()
  })
})

// ─── Input step — tabs ─────────────────────────────────────────────────────

test.describe('/reconcile — input step', () => {
  test('Upload CSV tab is active by default', async ({ page }) => {
    await page.goto('/reconcile')
    await page.waitForLoadState('networkidle')
    const uploadBtn = page.getByRole('button', { name: /upload csv/i })
    await expect(uploadBtn).toHaveAttribute('aria-pressed', 'true')
  })

  test('switching to Paste CSV tab shows textarea', async ({ page }) => {
    await page.goto('/reconcile')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /paste csv/i }).click()
    await expect(page.getByLabel(/paste csv contents/i)).toBeVisible()
  })

  test('"Find matching payments" button is disabled when no CSV is loaded', async ({ page }) => {
    await page.goto('/reconcile')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /find matching payments/i })).toBeDisabled()
  })

  test('shows error when CSV has no credit rows', async ({ page }) => {
    await page.goto('/reconcile')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /paste csv/i }).click()
    await page.getByLabel(/paste csv contents/i).fill(
      'Date,Narration,Debit,Credit,Balance\n19/04/2026,UPI/Nike,5000,,95000',
    )
    await page.getByRole('button', { name: /find matching payments/i }).click()
    await expect(page.locator('[role="alert"]').first()).toContainText(/credit/i)
  })
})

// ─── Match flow ────────────────────────────────────────────────────────────

test.describe('/reconcile — match and review flow', () => {
  test('matches a pending payment and shows review table', async ({ page, request }) => {
    const dealId = await createTestDeal(request, {
      title: `Reconcile Deal ${Date.now()}`,
      brandName: 'NikeBrand',
      status: 'ACTIVE',
    })
    await createPayment(request, dealId, { amount: 50000 })

    await page.goto('/reconcile')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /paste csv/i }).click()
    await page.getByLabel(/paste csv contents/i).fill(SAMPLE_CSV(50000, 'NikeBrand'))
    await page.getByRole('button', { name: /find matching payments/i }).click()

    await expect(page.getByRole('table', { name: /payment matches/i })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/match.*found/i)).toBeVisible()
  })

  test('shows "no matching payments" when no pending payments exist for CSV amounts', async ({ page, request }) => {
    const dealId = await createTestDeal(request, { title: `No Match Deal ${Date.now()}`, status: 'ACTIVE' })
    await createPayment(request, dealId, { amount: 12345 })

    await page.goto('/reconcile')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /paste csv/i }).click()
    // ₹3 — absurdly small, can't match any realistic pending payment in any DB state
    await page.getByLabel(/paste csv contents/i).fill(SAMPLE_CSV(3, 'UnknownBrand'))
    await page.getByRole('button', { name: /find matching payments/i }).click()

    await expect(page.getByText(/no matching payments found/i)).toBeVisible({ timeout: 15_000 })
  })

  test('"Try again" button in empty state returns to input step', async ({ page, request }) => {
    const dealId = await createTestDeal(request, { title: `Try Again Deal ${Date.now()}`, status: 'ACTIVE' })
    await createPayment(request, dealId, { amount: 12345 })

    await page.goto('/reconcile')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /paste csv/i }).click()
    await page.getByLabel(/paste csv contents/i).fill(SAMPLE_CSV(3, 'X'))
    await page.getByRole('button', { name: /find matching payments/i }).click()

    await expect(page.getByText(/no matching payments found/i)).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: /try again/i }).click()
    await expect(page.getByRole('button', { name: /find matching payments/i })).toBeVisible()
  })

  test('"Start over" button returns to input step', async ({ page, request }) => {
    const dealId = await createTestDeal(request, {
      title: `Start Over Deal ${Date.now()}`,
      brandName: 'StartBrand',
      status: 'ACTIVE',
    })
    await createPayment(request, dealId, { amount: 30000 })

    await page.goto('/reconcile')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /paste csv/i }).click()
    await page.getByLabel(/paste csv contents/i).fill(SAMPLE_CSV(30000, 'StartBrand'))
    await page.getByRole('button', { name: /find matching payments/i }).click()

    await expect(page.getByRole('table', { name: /payment matches/i })).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: /start over/i }).click()
    await expect(page.getByRole('button', { name: /find matching payments/i })).toBeVisible()
  })
})

// ─── Review step — selection controls ─────────────────────────────────────

test.describe('/reconcile — review step selection', () => {
  async function goToReview(
    page: import('@playwright/test').Page,
    request: import('@playwright/test').APIRequestContext,
  ) {
    const dealId = await createTestDeal(request, {
      title: `Selection Deal ${Date.now()}`,
      brandName: 'SelectBrand',
      status: 'ACTIVE',
    })
    await createPayment(request, dealId, { amount: 45000 })

    await page.goto('/reconcile')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /paste csv/i }).click()
    await page.getByLabel(/paste csv contents/i).fill(SAMPLE_CSV(45000, 'SelectBrand'))
    await page.getByRole('button', { name: /find matching payments/i }).click()
    await expect(page.getByRole('table', { name: /payment matches/i })).toBeVisible({ timeout: 15_000 })
  }

  test('deselect-all removes all selections and disables apply button', async ({ page, request }) => {
    await goToReview(page, request)
    const toggleBtn = page.getByRole('button', { name: /deselect all|select all/i })
    const label = await toggleBtn.innerText()
    if (/deselect/i.test(label)) {
      await toggleBtn.click()
    }
    await expect(page.getByRole('button', { name: /mark 0 payments/i })).toBeDisabled()
  })

  test('mark-received button shows selected count', async ({ page, request }) => {
    await goToReview(page, request)
    const applyBtn = page.getByRole('button', { name: /mark \d+ payment/i })
    await expect(applyBtn).toBeVisible()
  })
})

// ─── Apply flow ────────────────────────────────────────────────────────────

test.describe('/reconcile — apply flow', () => {
  test('marking payments received redirects to /attention with success toast', async ({ page, request }) => {
    const dealId = await createTestDeal(request, {
      title: `Apply Deal ${Date.now()}`,
      brandName: 'ApplyBrand',
      status: 'ACTIVE',
    })
    await createPayment(request, dealId, { amount: 60000 })

    await page.goto('/reconcile')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /paste csv/i }).click()
    await page.getByLabel(/paste csv contents/i).fill(SAMPLE_CSV(60000, 'ApplyBrand'))
    await page.getByRole('button', { name: /find matching payments/i }).click()

    await expect(page.getByRole('table', { name: /payment matches/i })).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: /mark \d+ payment/i }).click()

    await expect(page).toHaveURL(/attention/, { timeout: 10_000 })
    await expect(page.getByText(/payment.*marked received|marked received/i).first()).toBeVisible()
  })
})
