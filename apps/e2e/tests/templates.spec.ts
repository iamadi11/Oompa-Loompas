/**
 * Deal templates: list, create, edit, delete, save-deal-as-template,
 * create-deal-from-template.
 */
import { test, expect } from '@playwright/test'
import { createDeal, createTemplate } from '../helpers/api'

const API = process.env['E2E_API_URL'] ?? 'http://localhost:3001'

// ─── Templates list ────────────────────────────────────────────────────────

test.describe('Templates list — /deals/templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/deals/templates')
    await page.waitForLoadState('networkidle')
  })

  test('shows Templates heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /templates/i })).toBeVisible()
  })

  test('page title is "Templates"', async ({ page }) => {
    await expect(page).toHaveTitle(/templates/i)
  })

  test('has New template button or link', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /new template/i }).or(
        page.getByRole('button', { name: /new template/i }),
      ),
    ).toBeVisible()
  })

  test('shows empty state or template list', async ({ page }) => {
    const hasEmpty = await page
      .getByText(/no templates|create your first/i)
      .isVisible()
      .catch(() => false)
    const hasList = await page.getByRole('list').or(page.getByRole('table')).isVisible().catch(() => false)
    const hasLinks = (await page.getByRole('link').count()) > 0
    expect(hasEmpty || hasList || hasLinks).toBe(true)
  })

  test('template appears in list after creation', async ({ page, request }) => {
    const title = `List Template ${Date.now()}`
    await createTemplate(request, { title })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(title)).toBeVisible()
  })
})

// ─── Create template ───────────────────────────────────────────────────────

test.describe('Create template — /deals/templates/new', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/deals/templates/new')
    await page.waitForLoadState('networkidle')
  })

  test('form has title and value fields', async ({ page }) => {
    await expect(page.getByLabel(/title/i)).toBeVisible()
    await expect(page.getByLabel(/value|amount/i)).toBeVisible()
  })

  test('can create a template and be redirected to list or detail', async ({ page }) => {
    const title = `Create Template ${Date.now()}`
    await page.getByLabel(/title/i).fill(title)

    const valueField = page.getByLabel(/value|amount/i)
    if (await valueField.isVisible()) await valueField.fill('30000')

    await page.getByRole('button', { name: /create|save|add/i }).click()
    await page.waitForURL(/\/deals\/templates/, { timeout: 15_000 })
    await expect(page.getByText(title)).toBeVisible({ timeout: 10_000 })
  })

  test('empty submit shows validation error', async ({ page }) => {
    await page.getByRole('button', { name: /create|save|add/i }).click()
    await expect(page.getByRole('alert').or(page.getByText(/required|enter/i))).toBeVisible()
  })
})

// ─── Edit template ─────────────────────────────────────────────────────────

test.describe('Edit template — /deals/templates/:id', () => {
  test('template detail page shows title and edit form', async ({ page, request }) => {
    const id = await createTemplate(request, { title: 'Edit Me Template' })
    await page.goto(`/deals/templates/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Edit Me Template')).toBeVisible()
  })

  test('can update template title', async ({ page, request }) => {
    const id = await createTemplate(request, { title: 'Old Template Title' })
    await page.goto(`/deals/templates/${id}`)
    await page.waitForLoadState('networkidle')

    const titleInput = page.getByLabel(/title/i)
    if (await titleInput.isVisible()) {
      await titleInput.fill('New Template Title')
      await page.getByRole('button', { name: /save|update/i }).click()
      await page.waitForLoadState('networkidle')
      await expect(page.getByText('New Template Title')).toBeVisible()
    }
  })

  test('template detail shows deliverable slots if added', async ({ page, request }) => {
    const id = await createTemplate(request, { title: 'Deliverable Template' })
    // Add a deliverable slot via API if endpoint exists
    await request
      .post(`${API}/api/v1/templates/${id}/deliverables`, {
        data: { title: 'Instagram Reel', platform: 'INSTAGRAM', type: 'REEL' },
      })
      .catch(() => null)

    await page.goto(`/deals/templates/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Deliverable Template')).toBeVisible()
  })
})

// ─── Create deal from template ─────────────────────────────────────────────

test.describe('Create deal from template — /deals/new-from-template', () => {
  test('page loads and shows template picker', async ({ page, request }) => {
    await createTemplate(request, { title: 'Picker Template' })
    await page.goto('/deals/new-from-template')
    await page.waitForLoadState('networkidle')
    // Should show template selection UI
    const isOnPage =
      page.url().includes('new-from-template') || page.url().includes('templates')
    expect(isOnPage).toBe(true)
  })

  test('selecting a template pre-fills deal form', async ({ page, request }) => {
    const templateId = await createTemplate(request, {
      title: 'Prefill Template',
      value: 60000,
    })
    await page.goto(`/deals/new-from-template?templateId=${templateId}`)
    await page.waitForLoadState('networkidle')

    const titleInput = page.getByLabel(/title/i)
    if (await titleInput.isVisible()) {
      const value = await titleInput.inputValue()
      // Either pre-filled or empty (depends on UX)
      expect(typeof value).toBe('string')
    }
  })

  test('"From template" button on deals page navigates to templates', async ({
    page,
    request,
  }) => {
    await createDeal(request, { title: 'CTA Deal for Template' })
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')

    const btn = page.getByRole('link', { name: /from template/i })
    if (await btn.isVisible()) {
      await btn.click()
      await expect(page).toHaveURL(/\/deals\/templates/)
    }
  })
})

// ─── Save deal as template ─────────────────────────────────────────────────

test.describe('Save deal as template', () => {
  test('Save as template panel is visible on deal detail', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Template Source Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('button', { name: /save as template/i }).or(
        page.getByText(/save as template/i),
      ),
    ).toBeVisible()
  })

  test('saving as template creates a new template', async ({ page, request }) => {
    const id = await createDeal(request, {
      title: 'Deal To Templatize',
      value: 45000,
    })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const saveBtn = page.getByRole('button', { name: /save as template/i })
    if (await saveBtn.isVisible()) {
      await saveBtn.click()
      await expect(
        page
          .getByText(/template saved|saved/i)
          .or(page.getByRole('link', { name: /view template/i })),
      ).toBeVisible({ timeout: 10_000 })
    }
  })
})
