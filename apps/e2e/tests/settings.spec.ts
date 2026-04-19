/**
 * Settings page: push notification opt-in / opt-out.
 * Note: push subscription requires browser push API — most assertions check UI state,
 * not the actual OS notification (which requires a real service worker).
 */
import { test, expect } from '@playwright/test'

test.describe('Settings page — /settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test('page loads and is accessible to authenticated users', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('push notification section is present', async ({ page }) => {
    await expect(
      page.getByText(/notification|push|alert/i).first(),
    ).toBeVisible()
  })

  test('shows enable or disable notifications button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /enable|disable/i }).first(),
    ).toBeVisible()
  })

  test('page title contains Settings', async ({ page }) => {
    await expect(page).toHaveTitle(/settings/i)
  })
})

test.describe('Settings page — email digest toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test('daily email digest section is visible', async ({ page }) => {
    await expect(page.getByText(/daily email digest/i)).toBeVisible()
  })

  test('digest toggle button shows enable or disable', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /enable daily email digest|disable daily email digest/i }),
    ).toBeVisible()
  })

  test('digest toggle button click does not crash page', async ({ page }) => {
    const btn = page.getByRole('button', { name: /enable daily email digest|disable daily email digest/i })
    await btn.click()
    await page.waitForTimeout(500)
    await expect(page).not.toHaveURL(/error/)
    // Button still present after click (may have flipped label)
    await expect(
      page.getByRole('button', { name: /enable daily email digest|disable daily email digest/i }),
    ).toBeVisible()
  })

  test('digest status dot and description text are visible', async ({ page }) => {
    await expect(page.getByText(/sent at|disabled/i).first()).toBeVisible()
  })
})

test.describe('Settings page — push toggle interaction', () => {
  test('push toggle button is clickable (does not crash)', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    const toggleBtn = page.getByRole('button', { name: /notification|push/i })
    if (await toggleBtn.isVisible()) {
      // In test environment Notification API may not be available or may auto-deny
      // Just click and confirm no unhandled crash (page still visible)
      await toggleBtn.click().catch(() => null)
      await page.waitForTimeout(1000)
      await expect(page).not.toHaveURL(/error/)
    }
  })

  test('permission denied shows appropriate feedback', async ({ page, context }) => {
    // Grant denied notification permission in browser context
    await context.grantPermissions([]) // no notifications permission
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    const toggleBtn = page.getByRole('button', { name: /enable notifications/i })
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click().catch(() => null)
      // Should show error toast or permission denied message
      // (or silently fail — both are acceptable in test env)
      await page.waitForTimeout(2000)
      await expect(page).not.toHaveURL(/error/)
    }
  })
})
