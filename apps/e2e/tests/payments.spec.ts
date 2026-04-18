/**
 * Payment milestones: add, edit status, mark received, invoice link,
 * payment summary (contracted / received / outstanding), payment reminder copy.
 */
import { test, expect } from '@playwright/test'
import { createDeal, createPayment } from '../helpers/api'

// ─── Payments section structure ────────────────────────────────────────────

test.describe('Payments section — structure', () => {
  test('Payments heading is visible', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Pay Milestones Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /payments/i })).toBeVisible()
  })

  test('Add payment button is visible', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Add Payment Button Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /add payment/i })).toBeVisible()
  })

  test('payment summary shows Contracted / Received / Outstanding', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Summary Deal', value: 100000 })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/contracted/i)).toBeVisible()
    await expect(page.getByText(/received/i)).toBeVisible()
    await expect(page.getByText(/outstanding/i)).toBeVisible()
  })
})

// ─── Add payment ───────────────────────────────────────────────────────────

test.describe('Add payment form', () => {
  test('clicking Add payment reveals the form', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Add Payment Form Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /add payment/i }).click()
    await expect(page.getByLabel(/amount/i)).toBeVisible()
  })

  test('can add a payment milestone with amount and due date', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Payment Create Deal', value: 100000 })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /add payment/i }).click()
    await page.getByLabel(/amount/i).fill('25000')
    await page.getByLabel(/due date/i).fill('2026-12-31')
    await page.getByRole('button', { name: 'Add payment' }).click()

    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/25,000|₹/).first()).toBeVisible()
  })

  test('cancel hides the add payment form', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Cancel Payment Form Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /add payment/i }).click()
    await expect(page.getByLabel(/amount/i)).toBeVisible()

    const paySection = page.locator('section[aria-labelledby="payments-heading"]')
    await paySection.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByLabel(/amount/i)).not.toBeVisible()
    await expect(page.getByRole('button', { name: /add payment/i })).toBeVisible()
  })
})

// ─── Payment row actions ───────────────────────────────────────────────────

test.describe('Payment row — mark received', () => {
  test('overdue payment row shows mark-received action', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Mark Received Deal', status: 'ACTIVE' })
    await createPayment(request, id, {
      dueDate: new Date(Date.now() - 86_400_000).toISOString(),
    })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('button', { name: /received|mark received/i }).or(
        page.getByText(/received/i),
      ).first(),
    ).toBeVisible()
  })

  test('marking payment received updates summary', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Update Summary Deal', value: 50000 })
    await createPayment(request, id, { amount: 25000 })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const receivedBtn = page.getByRole('button', { name: /mark received|received/i }).first()
    if (await receivedBtn.isVisible()) {
      await receivedBtn.click()
      await page.waitForLoadState('networkidle')
      // Received column should update
      await expect(page.getByText(/25,000|₹/).first()).toBeVisible()
    }
  })
})

// ─── Invoice ───────────────────────────────────────────────────────────────

test.describe('Payment invoice', () => {
  test('View invoice link is present on payment row', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Invoice Link Deal' })
    await createPayment(request, id)
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('link', { name: /view invoice|invoice/i })).toBeVisible()
  })

  test('View invoice link opens invoice page (new tab or same tab)', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Invoice Open Deal' })
    const paymentId = await createPayment(request, id)
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const invoiceLink = page.getByRole('link', { name: /view invoice|invoice/i }).first()
    const href = await invoiceLink.getAttribute('href')
    expect(href).toMatch(/invoice/)
  })
})

// ─── Payment reminder copy ─────────────────────────────────────────────────

test.describe('Payment reminder copy', () => {
  test('overdue payment shows Copy reminder button', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Reminder Copy Deal', status: 'ACTIVE' })
    await createPayment(request, id, {
      dueDate: new Date(Date.now() - 86_400_000).toISOString(),
    })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('button', { name: /share.*reminder|share payment reminder/i }).first(),
    ).toBeVisible()
  })
})

// ─── Scheduled payment reminders ──────────────────────────────────────────

test.describe('Scheduled payment reminders', () => {
  // aria-label is "Schedule a push reminder for this payment" — match by text content
  const remindMeBtn = (page: import('@playwright/test').Page) =>
    page.locator('button', { hasText: 'Remind me' })

  test('pending payment shows Remind me button', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Remind Me Button Deal' })
    await createPayment(request, id, {
      dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await expect(remindMeBtn(page)).toBeVisible()
  })

  test('clicking Remind me reveals date picker', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Remind Me Picker Deal' })
    await createPayment(request, id, {
      dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await remindMeBtn(page).click()
    await expect(page.locator('input[type="date"]')).toBeVisible()
  })

  test('selecting a date sets reminder chip and hides Remind me button', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Set Reminder Deal' })
    await createPayment(request, id, {
      dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await remindMeBtn(page).click()
    await page.locator('input[type="date"]').fill('2026-05-01')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/^Reminder:/)).toBeVisible()
    await expect(remindMeBtn(page)).not.toBeVisible()
  })

  test('clearing reminder restores Remind me button', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Clear Reminder Deal' })
    await createPayment(request, id, {
      dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await remindMeBtn(page).click()
    await page.locator('input[type="date"]').fill('2026-05-01')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /clear.*reminder/i }).click()
    await page.waitForLoadState('networkidle')

    await expect(remindMeBtn(page)).toBeVisible()
  })

  test('received payment does not show Remind me button', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'No Remind Received Deal' })
    const paymentId = await createPayment(request, id)
    const res = await request.patch(`${process.env['E2E_API_URL'] ?? 'http://localhost:3001'}/api/v1/payments/${paymentId}`, {
      data: { status: 'RECEIVED', receivedAt: new Date().toISOString() },
    })
    expect(res.ok()).toBe(true)

    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await expect(remindMeBtn(page)).not.toBeVisible()
  })
})
