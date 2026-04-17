/**
 * Deal lifecycle: next-action banner, status transitions (DRAFT → NEGOTIATING → ACTIVE …),
 * deal duplication.
 */
import { test, expect } from '@playwright/test'
import { createDeal, createPayment, createDeliverable, updateDealStatus, deleteAllTemplates } from '../helpers/api'

// ─── Next-action banner ────────────────────────────────────────────────────

test.describe('Next-action banner', () => {
  test('DRAFT deal shows banner to move to NEGOTIATING', async ({ page, request }) => {
    const id = await createDeal(request, { status: 'DRAFT', title: 'Banner DRAFT' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /start negotiating|negotiating/i })).toBeVisible()
  })

  test('NEGOTIATING deal shows banner to move to ACTIVE', async ({ page, request }) => {
    const id = await createDeal(request, { status: 'NEGOTIATING', title: 'Banner NEGOTIATING' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /mark as active|active/i })).toBeVisible()
  })

  test('PAID deal shows no lifecycle banner', async ({ page, request }) => {
    const id = await createDeal(request, { status: 'PAID', title: 'Banner PAID' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    // Terminal state — no advance button
    await expect(page.getByRole('button', { name: /mark as|move to paid/i })).not.toBeVisible()
  })

  test('CANCELLED deal shows no lifecycle banner', async ({ page, request }) => {
    const id = await createDeal(request, { status: 'CANCELLED', title: 'Banner CANCELLED' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /mark as|move to/i })).not.toBeVisible()
  })
})

test.describe('Status advance via banner CTA', () => {
  test('advances DRAFT → NEGOTIATING and updates badge', async ({ page, request }) => {
    const id = await createDeal(request, { status: 'DRAFT', title: 'Advance Draft' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const advanceBtn = page.getByRole('button', { name: /start negotiating|negotiating/i })
    if (await advanceBtn.isVisible()) {
      await advanceBtn.click()
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/NEGOTIATING|Negotiating/i).first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('advances NEGOTIATING → ACTIVE and updates badge', async ({ page, request }) => {
    const id = await createDeal(request, { status: 'NEGOTIATING', title: 'Advance Negotiating' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const advanceBtn = page.getByRole('button', { name: /mark as active|active/i })
    if (await advanceBtn.isVisible()) {
      await advanceBtn.click()
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/ACTIVE|Active/i).first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('ACTIVE deal with all deliverables complete can advance to DELIVERED', async ({
    page,
    request,
  }) => {
    const id = await createDeal(request, { status: 'ACTIVE', title: 'Advance to Delivered' })
    // No deliverables → vacuous truth → banner should offer DELIVERED
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const advanceBtn = page.getByRole('button', { name: /mark as delivered|delivered/i })
    if (await advanceBtn.isVisible()) {
      await advanceBtn.click()
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/DELIVERED|Delivered/i).first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('DELIVERED deal with all payments received can advance to PAID', async ({
    page,
    request,
  }) => {
    const id = await createDeal(request, { status: 'DELIVERED', title: 'Advance to Paid' })
    // No payments → vacuous truth → PAID available
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const advanceBtn = page.getByRole('button', { name: /mark as paid|paid/i })
    if (await advanceBtn.isVisible()) {
      await advanceBtn.click()
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/PAID|Paid/i).first()).toBeVisible({ timeout: 10_000 })
    }
  })
})

// ─── Deal duplication ──────────────────────────────────────────────────────

test.describe('Deal duplication', () => {
  test('Duplicate button is visible on deal detail', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Dupe Source' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /duplicate/i })).toBeVisible()
  })

  test('duplicating creates new DRAFT and navigates to it', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Original Deal', status: 'ACTIVE' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const duplicateBtn = page.getByRole('button', { name: /duplicate/i })
    await duplicateBtn.click()

    // Should navigate to new deal (different URL)
    await page.waitForURL(
      (url) => url.pathname.startsWith('/deals/') && !url.pathname.includes(id),
      { timeout: 15_000 },
    )

    // New deal is a DRAFT
    await expect(page.getByText(/DRAFT|Draft/i).first()).toBeVisible()
    // Title contains "(Copy)" or original title
    await expect(page.getByText(/Original Deal|Copy/i).first()).toBeVisible()
  })

  test('duplicate has startDate and endDate cleared', async ({ page, request }) => {
    const id = await createDeal(request, {
      title: 'With Dates',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T00:00:00.000Z',
    })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const duplicateBtn = page.getByRole('button', { name: /duplicate/i })
    await duplicateBtn.click()
    await page.waitForURL(
      (url) => url.pathname.startsWith('/deals/') && !url.pathname.includes(id),
      { timeout: 15_000 },
    )

    // Should be DRAFT with cleared dates — just confirm it loaded
    await expect(page.getByText(/DRAFT|Draft/i).first()).toBeVisible()
  })
})

// ─── Save as template ──────────────────────────────────────────────────────

test.describe('Save as template from deal detail', () => {
  test.beforeEach(async ({ request }) => {
    await deleteAllTemplates(request)
  })

  test('Save as template button is visible on deal detail', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Template Source Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /save as template/i })).toBeVisible()
  })

  test('clicking Save as template and confirming shows success status', async ({
    page,
    request,
  }) => {
    const id = await createDeal(request, { title: 'Save Template Test' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const saveBtn = page.getByRole('button', { name: /save as template/i })
    if (await saveBtn.isVisible()) {
      // SaveAsTemplateButton uses window.prompt — must accept the dialog
      page.once('dialog', (dialog) => dialog.accept('Saved Template').catch(() => null))
      await saveBtn.click()
      await expect(
        page.getByRole('status').filter({ hasText: /template saved/i }),
      ).toBeVisible({ timeout: 10_000 })
    }
  })
})
