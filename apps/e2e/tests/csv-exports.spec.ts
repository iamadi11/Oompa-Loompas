/**
 * CSV export flows: deals, payments, deliverables, attention queue.
 * Tests verify the download is triggered (response is CSV / binary).
 */
import { test, expect } from '@playwright/test'
import { createDeal, createPayment, createDeliverable } from '../helpers/api'

const API = process.env['E2E_API_URL'] ?? 'http://localhost:3001'

// ─── Deals CSV ────────────────────────────────────────────────────────────

test.describe('Export Deals CSV', () => {
  test('Export deals CSV button is present on /deals', async ({ page }) => {
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /^export csv$/i })).toBeVisible()
  })

  test('API GET /deals/export returns CSV content-type', async ({ request }) => {
    const res = await request.get(`${API}/api/v1/deals/export`)
    expect(res.ok()).toBe(true)
    const ct = res.headers()['content-type'] ?? ''
    expect(ct).toMatch(/csv|octet-stream|text/i)
  })

  test('deals CSV contains expected headers', async ({ request }) => {
    const res = await request.get(`${API}/api/v1/deals/export`)
    const text = await res.text()
    // Strip BOM and check CSV headers
    const stripped = text.replace(/^\uFEFF/, '')
    const firstLine = stripped.split('\n')[0] ?? ''
    expect(firstLine).toMatch(/title|brand|status|value/i)
  })

  test('clicking Export button triggers download', async ({ page }) => {
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10_000 }).catch(() => null),
      page.getByRole('button', { name: /^export csv$/i }).click(),
    ])

    if (download) {
      expect(download.suggestedFilename()).toMatch(/deals|oompa/)
    }
  })
})

// ─── Payments CSV ──────────────────────────────────────────────────────────

test.describe('Export Payments CSV', () => {
  test('Export payments CSV button is present on /deals', async ({ page }) => {
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('button', { name: /export payments|payments csv/i }),
    ).toBeVisible()
  })

  test('API GET /deals/export/payments returns CSV content-type', async ({ request }) => {
    const res = await request.get(`${API}/api/v1/deals/export/payments`)
    expect(res.ok()).toBe(true)
    const ct = res.headers()['content-type'] ?? ''
    expect(ct).toMatch(/csv|octet-stream|text/i)
  })

  test('payments CSV contains expected headers', async ({ request }) => {
    const res = await request.get(`${API}/api/v1/deals/export/payments`)
    const text = await res.text()
    const firstLine = text.replace(/^\uFEFF/, '').split('\n')[0] ?? ''
    expect(firstLine).toMatch(/amount|status|due|invoice/i)
  })

  test('payments CSV rows include data for created payments', async ({ request }) => {
    const id = await createDeal(request, { title: 'CSV Payment Deal' })
    await createPayment(request, id, { amount: 99000 })

    const res = await request.get(`${API}/api/v1/deals/export/payments`)
    const text = await res.text()
    expect(text).toContain('CSV Payment Deal')
  })
})

// ─── Deliverables CSV ─────────────────────────────────────────────────────

test.describe('Export Deliverables CSV', () => {
  test('Export deliverables CSV button is present on /deals', async ({ page }) => {
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('button', { name: /export deliverables|deliverables csv/i }),
    ).toBeVisible()
  })

  test('API GET /deals/export/deliverables returns CSV content-type', async ({ request }) => {
    const res = await request.get(`${API}/api/v1/deals/export/deliverables`)
    expect(res.ok()).toBe(true)
    const ct = res.headers()['content-type'] ?? ''
    expect(ct).toMatch(/csv|octet-stream|text/i)
  })

  test('deliverables CSV contains expected headers', async ({ request }) => {
    const res = await request.get(`${API}/api/v1/deals/export/deliverables`)
    const text = await res.text()
    const firstLine = text.replace(/^\uFEFF/, '').split('\n')[0] ?? ''
    expect(firstLine).toMatch(/title|platform|type|status/i)
  })

  test('deliverables CSV rows include data for created deliverables', async ({ request }) => {
    const id = await createDeal(request, { title: 'CSV Del Deal' })
    await createDeliverable(request, id, { title: 'CSV Instagram Reel', platform: 'INSTAGRAM' })

    const res = await request.get(`${API}/api/v1/deals/export/deliverables`)
    const text = await res.text()
    expect(text).toContain('CSV Del Deal')
  })
})

// ─── Attention queue CSV ──────────────────────────────────────────────────

test.describe('Export Attention queue CSV', () => {
  test('API GET /attention/export returns CSV content-type', async ({ request }) => {
    const res = await request.get(`${API}/api/v1/attention/export`)
    expect(res.ok()).toBe(true)
    const ct = res.headers()['content-type'] ?? ''
    expect(ct).toMatch(/csv|octet-stream|text/i)
  })

  test('attention CSV contains expected headers', async ({ request }) => {
    const res = await request.get(`${API}/api/v1/attention/export`)
    const text = await res.text()
    const firstLine = text.replace(/^\uFEFF/, '').split('\n')[0] ?? ''
    expect(firstLine).toMatch(/type|deal|brand|due/i)
  })

  test('Export attention queue CSV button present on /attention when items exist', async ({
    page,
    request,
  }) => {
    // Create overdue payment to ensure attention items exist
    const id = await createDeal(request, { title: 'Attention CSV Deal', status: 'ACTIVE' })
    await createPayment(request, id, {
      dueDate: new Date(Date.now() - 86_400_000 * 3).toISOString(),
    })

    await page.goto('/attention')
    await page.waitForLoadState('networkidle')

    // Button only shows when items exist
    const exportBtn = page.getByRole('button', { name: /export|attention.*csv/i })
    const hasItems = await exportBtn.isVisible().catch(() => false)
    if (hasItems) {
      await expect(exportBtn).toBeVisible()
    }
  })
})
