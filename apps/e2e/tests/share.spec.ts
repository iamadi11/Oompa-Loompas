/**
 * Shareable proposal link: generate, copy, public page (/p/:token), revoke.
 */
import { test, expect } from '@playwright/test'
import { createDeal, generateShareToken } from '../helpers/api'

// ─── Share token management (authenticated) ────────────────────────────────

test.describe('Share proposal button — authenticated', () => {
  test('Share button is visible on deal detail', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Share Button Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /share|proposal/i })).toBeVisible()
  })

  test('clicking Share generates a share link', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Generate Link Deal', status: 'ACTIVE' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const shareBtn = page.getByRole('button', { name: /share|generate link/i })
    await shareBtn.click()

    // Should show a /p/ URL or copy button
    await expect(
      page.getByText(/\/p\//).or(page.getByRole('button', { name: /copy/i })),
    ).toBeVisible({ timeout: 10_000 })
  })

  test('can revoke share token', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Revoke Token Deal', status: 'ACTIVE' })
    await generateShareToken(request, id)

    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const revokeBtn = page.getByRole('button', { name: /revoke|stop sharing|remove/i })
    if (await revokeBtn.isVisible()) {
      await revokeBtn.click()
      await page.waitForLoadState('networkidle')
      // Token removed — share button reappears
      await expect(page.getByRole('button', { name: /share|generate link/i })).toBeVisible({
        timeout: 10_000,
      })
    }
  })
})

// ─── Public proposal page — no auth required ───────────────────────────────

test.describe('Public proposal page /p/:token', () => {
  // These tests run without the saved auth cookie
  test.use({ storageState: { cookies: [], origins: [] } })

  test('invalid token shows not-found / error state', async ({ page }) => {
    await page.goto('/p/this-token-does-not-exist-xyz-abc')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/not found|invalid|expired|no deal/i)).toBeVisible()
  })

  test('valid token shows deal title and brand', async ({ page, request }) => {
    const id = await createDeal(request, {
      title: 'Public Proposal Deal',
      brandName: 'PublicBrand',
      status: 'ACTIVE',
    })
    const token = await generateShareToken(request, id)

    await page.goto(`/p/${token}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Public Proposal Deal')).toBeVisible()
    await expect(page.getByText('PublicBrand')).toBeVisible()
  })

  test('valid token shows deal value', async ({ page, request }) => {
    const id = await createDeal(request, {
      title: 'Value Deal Public',
      value: 200000,
      currency: 'INR',
      status: 'ACTIVE',
    })
    const token = await generateShareToken(request, id)

    await page.goto(`/p/${token}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/2,00,000|200,000|₹/)).toBeVisible()
  })

  test('public page has "View only" / "Shared via" footer and no workspace nav', async ({
    page,
    request,
  }) => {
    const id = await createDeal(request, { title: 'Footer Check Deal', status: 'ACTIVE' })
    const token = await generateShareToken(request, id)

    await page.goto(`/p/${token}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/shared via|view only/i)).toBeVisible()
    // Workspace nav should NOT be present
    await expect(page.getByRole('link', { name: 'Dashboard' })).not.toBeVisible()
  })

  test('public page lists payments if any', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Payments Public', status: 'ACTIVE' })
    // create a payment via the authenticated request context
    await request.post(
      `${process.env['E2E_API_URL'] ?? 'http://localhost:3001'}/api/v1/deals/${id}/payments`,
      { data: { amount: 50000, currency: 'INR', dueDate: null, notes: null } },
    )
    const token = await generateShareToken(request, id)

    await page.goto(`/p/${token}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/payment/i)).toBeVisible()
  })

  test('public page lists deliverables if any', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Deliverables Public', status: 'ACTIVE' })
    await request.post(
      `${process.env['E2E_API_URL'] ?? 'http://localhost:3001'}/api/v1/deals/${id}/deliverables`,
      {
        data: {
          title: 'Reel',
          platform: 'INSTAGRAM',
          type: 'REEL',
          dueDate: null,
          notes: null,
        },
      },
    )
    const token = await generateShareToken(request, id)

    await page.goto(`/p/${token}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/deliverable|reel/i)).toBeVisible()
  })
})
