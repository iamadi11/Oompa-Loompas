/**
 * Deliverable approval flow: generate link, brand approval page (/a/:token), revoke.
 */
import { test, expect } from '@playwright/test'
import { createDeal, createDeliverable, generateApprovalToken } from '../helpers/api'

const API = process.env['E2E_API_URL'] ?? 'http://localhost:3001'

// ─── Approval button on deliverable row ───────────────────────────────────

test.describe('Deliverable row — approval button', () => {
  test('pending deliverable row shows "Share approval link" button', async ({ page, request }) => {
    const dealId = await createDeal(request, { title: 'Approval Button Deal', status: 'ACTIVE' })
    await createDeliverable(request, dealId, { title: 'Approval Test Reel' })
    await page.goto(`/deals/${dealId}`)
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('button', { name: /share approval link/i }).first(),
    ).toBeVisible()
  })

  test('clicking share approval link shows copy/revoke buttons', async ({ page, request }) => {
    const dealId = await createDeal(request, { title: 'Generate Approval Deal', status: 'ACTIVE' })
    await createDeliverable(request, dealId, { title: 'Click Approval Reel' })
    await page.goto(`/deals/${dealId}`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /share approval link/i }).first().click()

    // After generation: "Copy link" button appears (match by text content, not aria-label)
    await expect(page.locator('button', { hasText: 'Copy link' }).first()).toBeVisible({
      timeout: 10_000,
    })
  })

  test('after brand approval, row shows "Brand approved" badge', async ({ page, request }) => {
    const dealId = await createDeal(request, { title: 'Badge Deal', status: 'ACTIVE' })
    const delId = await createDeliverable(request, dealId, { title: 'Badge Reel' })
    const token = await generateApprovalToken(request, dealId, delId)

    // Brand approves via public API
    await request.post(`${API}/api/v1/approvals/${token}`)

    await page.goto(`/deals/${dealId}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/brand approved/i).first()).toBeVisible()
  })

  test('creator can revoke approval link', async ({ page, request }) => {
    const dealId = await createDeal(request, { title: 'Revoke Approval Deal', status: 'ACTIVE' })
    const delId = await createDeliverable(request, dealId, { title: 'Revoke Reel' })
    await generateApprovalToken(request, dealId, delId)

    await page.goto(`/deals/${dealId}`)
    await page.waitForLoadState('networkidle')

    // Revoke is rendered as a plain text button — match by text content only, not aria-label
    // (aria-label contains deliverable title which may itself contain "Revoke")
    const revokeBtn = page.locator('button', { hasText: /^Revoke$/ }).first()
    await expect(revokeBtn).toBeVisible({ timeout: 5_000 })
    await revokeBtn.click()
    await expect(
      page.getByRole('button', { name: /share approval link/i }).first(),
    ).toBeVisible({ timeout: 15_000 })
  })
})

// ─── Public approval page /a/:token ───────────────────────────────────────

test.describe('Public approval page /a/:token', () => {
  test('invalid token shows "not found" / "no longer valid" message', async ({ page }) => {
    await page.goto('/a/this-token-does-not-exist-xyz-abc-123')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText(/not found|invalid|expired|no longer valid|does not exist/i).first(),
    ).toBeVisible()
  })

  test('valid token shows deliverable title and deal context', async ({ request, page }) => {
    const dealId = await createDeal(request, {
      title: 'Public Approval Deal',
      brandName: 'ApprovalBrand',
      status: 'ACTIVE',
    })
    const delId = await createDeliverable(request, dealId, { title: 'Public Approval Reel' })
    const token = await generateApprovalToken(request, dealId, delId)

    await page.goto(`/a/${token}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Public Approval Reel')).toBeVisible()
    // Brand name appears — use first() since heading also appears
    await expect(page.getByText('ApprovalBrand').first()).toBeVisible()
  })

  test('valid token shows "Confirm Approval" CTA', async ({ request, page }) => {
    const dealId = await createDeal(request, { title: 'CTA Approval Deal', status: 'ACTIVE' })
    const delId = await createDeliverable(request, dealId, { title: 'CTA Reel' })
    const token = await generateApprovalToken(request, dealId, delId)

    await page.goto(`/a/${token}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('button', { name: /confirm approval/i })).toBeVisible()
  })

  test('clicking Confirm Approval shows confirmed state', async ({ request, page }) => {
    const dealId = await createDeal(request, { title: 'Confirm Deal', status: 'ACTIVE' })
    const delId = await createDeliverable(request, dealId, { title: 'Confirm Reel' })
    const token = await generateApprovalToken(request, dealId, delId)

    await page.goto(`/a/${token}`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /confirm approval/i }).click()

    await expect(page.getByText(/approved|confirmed/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('already-approved token shows confirmed state on load', async ({ request, page }) => {
    const dealId = await createDeal(request, { title: 'Already Approved Deal', status: 'ACTIVE' })
    const delId = await createDeliverable(request, dealId, { title: 'Already Reel' })
    const token = await generateApprovalToken(request, dealId, delId)

    // Pre-approve via API
    await request.post(`${API}/api/v1/approvals/${token}`)

    await page.goto(`/a/${token}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/approved|confirmed/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /confirm approval/i })).not.toBeVisible()
  })

  test('approval page has no workspace nav', async ({ request, page }) => {
    const dealId = await createDeal(request, { title: 'No Nav Deal', status: 'ACTIVE' })
    const delId = await createDeliverable(request, dealId, { title: 'No Nav Reel' })
    const token = await generateApprovalToken(request, dealId, delId)

    await page.goto(`/a/${token}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('link', { name: 'Attention' })).not.toBeVisible()
    await expect(page.getByRole('link', { name: 'Settings' })).not.toBeVisible()
  })
})
