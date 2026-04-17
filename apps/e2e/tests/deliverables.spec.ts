/**
 * Deliverables: add form (title, platform, type, due date), mark complete, overdue state.
 */
import { test, expect } from '@playwright/test'
import { createDeal, createDeliverable } from '../helpers/api'

// ─── Deliverables section structure ───────────────────────────────────────

test.describe('Deliverables section — structure', () => {
  test('Deliverables heading is visible', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Del Heading Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /deliverables/i })).toBeVisible()
  })

  test('Add deliverable button is visible', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Add Del Button Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /add deliverable/i }).first()).toBeVisible()
  })
})

// ─── Add deliverable ───────────────────────────────────────────────────────

test.describe('Add deliverable form', () => {
  test('clicking Add deliverable reveals the form', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Add Del Form Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /add deliverable/i }).first().click()
    await expect(page.locator('#deal-deliverable-title')).toBeVisible()
  })

  test('form has Platform and Type selects', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Del Platform Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /add deliverable/i }).first().click()
    await expect(page.getByLabel(/platform/i)).toBeVisible()
    await expect(page.getByLabel(/type/i)).toBeVisible()
  })

  test('can add a deliverable with all fields', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Full Del Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /add deliverable/i }).first().click()

    const title = `Reel ${Date.now()}`
    await page.locator('#deal-deliverable-title').fill(title)
    await page.getByLabel(/platform/i).selectOption('INSTAGRAM')
    await page.getByLabel(/type/i).selectOption('REEL')
    await page.getByLabel(/due date/i).fill('2026-12-31')

    const delSection = page.locator('section[aria-labelledby="deliverables-heading"]')
    await delSection.getByRole('button', { name: 'Add deliverable' }).click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(title)).toBeVisible()
  })

  test('cancel hides the add deliverable form', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Cancel Del Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /add deliverable/i }).first().click()
    await expect(page.locator('#deal-deliverable-title')).toBeVisible()

    const delSection = page.locator('section[aria-labelledby="deliverables-heading"]')
    await delSection.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.locator('#deal-deliverable-title')).not.toBeVisible()
    await expect(page.getByRole('button', { name: /add deliverable/i }).first()).toBeVisible()
  })

  test('all platform options are selectable', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Platform Options Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /add deliverable/i }).first().click()

    const platformSelect = page.getByLabel(/platform/i)
    const options = await platformSelect.locator('option').allTextContents()
    const expected = ['Instagram', 'YouTube', 'Twitter', 'LinkedIn', 'Podcast', 'Blog', 'Other']
    for (const opt of expected) {
      expect(options.some((o) => o.includes(opt))).toBe(true)
    }
  })

  test('all type options are selectable', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Type Options Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /add deliverable/i }).first().click()

    const typeSelect = page.getByLabel(/type/i)
    const options = await typeSelect.locator('option').allTextContents()
    const expected = ['Post', 'Reel', 'Story', 'Video', 'Integration', 'Mention', 'Article', 'Other']
    for (const opt of expected) {
      expect(options.some((o) => o.includes(opt))).toBe(true)
    }
  })
})

// ─── Deliverable row actions ───────────────────────────────────────────────

test.describe('Deliverable row — mark complete', () => {
  test('pending deliverable row shows mark-complete action', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Mark Complete Deal', status: 'ACTIVE' })
    await createDeliverable(request, id, { title: 'Test Reel' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await expect(
      page
        .getByRole('button', { name: /complete|mark complete/i })
        .or(page.getByRole('checkbox', { name: /complete/i }))
        .first(),
    ).toBeVisible()
  })

  test('overdue deliverable shows overdue indicator', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Overdue Del Deal', status: 'ACTIVE' })
    await createDeliverable(request, id, {
      title: 'Overdue Reel',
      dueDate: new Date(Date.now() - 86_400_000).toISOString(),
    })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/overdue/i).first()).toBeVisible()
  })
})
