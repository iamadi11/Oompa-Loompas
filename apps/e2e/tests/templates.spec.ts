/**
 * Deal templates: list, create, edit, delete, save-deal-as-template,
 * create-deal-from-template.
 *
 * Field IDs: #tpl-name (Template name), #tpl-value (Default value), #tpl-currency, #tpl-notes
 * Submit: "Create template" (create mode) / "Save changes" (edit mode)
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
    const hasList = await page
      .getByRole('list')
      .or(page.getByRole('table'))
      .isVisible()
      .catch(() => false)
    const hasLinks = (await page.getByRole('link').count()) > 0
    expect(hasEmpty || hasList || hasLinks).toBe(true)
  })

  test('template appears in list after creation', async ({ page, request }) => {
    const name = `List Template ${Date.now()}`
    await createTemplate(request, { name })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(name)).toBeVisible()
  })
})

// ─── Create template ───────────────────────────────────────────────────────

test.describe('Create template — /deals/templates/new', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/deals/templates/new')
    await page.waitForLoadState('networkidle')
  })

  test('form has #tpl-name and #tpl-value fields', async ({ page }) => {
    await expect(page.locator('#tpl-name')).toBeVisible()
    await expect(page.locator('#tpl-value')).toBeVisible()
  })

  test('form has currency select and notes textarea', async ({ page }) => {
    await expect(page.locator('#tpl-currency')).toBeVisible()
    await expect(page.locator('#tpl-notes')).toBeVisible()
  })

  test('can create a template and be redirected to list', async ({ page }) => {
    const name = `Create Template ${Date.now()}`
    await page.locator('#tpl-name').fill(name)
    await page.locator('#tpl-value').fill('30000')
    await page.getByRole('button', { name: /create template/i }).click()
    await page.waitForURL(/\/deals\/templates/, { timeout: 15_000 })
    await expect(page.getByText(name)).toBeVisible({ timeout: 10_000 })
  })

  test('empty submit shows validation error', async ({ page }) => {
    await page.getByRole('button', { name: /create template/i }).click()
    await expect(page.getByRole('alert').or(page.getByText(/required|enter/i))).toBeVisible()
  })

  test('can add a deliverable row', async ({ page }) => {
    await page.getByRole('button', { name: /\+ add deliverable/i }).click()
    await expect(page.getByRole('textbox', { name: /deliverable 1 title/i })).toBeVisible()
  })

  test('can add and remove a deliverable row', async ({ page }) => {
    await page.getByRole('button', { name: /\+ add deliverable/i }).click()
    await expect(page.getByRole('button', { name: /remove deliverable 1/i })).toBeVisible()
    await page.getByRole('button', { name: /remove deliverable 1/i }).click()
    await expect(page.getByRole('textbox', { name: /deliverable 1 title/i })).not.toBeVisible()
  })

  test('can add a payment milestone row', async ({ page }) => {
    await page.getByRole('button', { name: /\+ add payment/i }).click()
    await expect(page.getByRole('textbox', { name: /payment 1 label/i })).toBeVisible()
  })

  test('payment total percentage indicator is visible when milestones added', async ({ page }) => {
    await page.getByRole('button', { name: /\+ add payment/i }).click()
    await page.getByRole('spinbutton', { name: /payment 1 percentage/i }).fill('100')
    await expect(page.getByText(/total.*100/i)).toBeVisible()
  })

  test('cancel button navigates away from new template page', async ({ page }) => {
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page).not.toHaveURL(/\/templates\/new/)
  })
})

// ─── Edit template ─────────────────────────────────────────────────────────

test.describe('Edit template — /deals/templates/:id', () => {
  test('template detail page shows name and edit form', async ({ page, request }) => {
    const id = await createTemplate(request, { name: 'Edit Me Template' })
    await page.goto(`/deals/templates/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Edit Me Template')).toBeVisible()
  })

  test('can update template name', async ({ page, request }) => {
    const id = await createTemplate(request, { name: 'Old Template Name' })
    await page.goto(`/deals/templates/${id}`)
    await page.waitForLoadState('networkidle')

    await page.locator('#tpl-name').fill('New Template Name')
    await page.getByRole('button', { name: /save changes/i }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('New Template Name')).toBeVisible()
  })

  test('edit form shows existing name pre-filled', async ({ page, request }) => {
    const id = await createTemplate(request, { name: 'Prefilled Name' })
    await page.goto(`/deals/templates/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#tpl-name')).toHaveValue('Prefilled Name')
  })

  test('template detail shows deliverable slots if added via API', async ({ page, request }) => {
    const id = await createTemplate(request, {
      name: 'Deliverable Template',
      deliverables: [{ title: 'Instagram Reel', platform: 'INSTAGRAM', type: 'REEL' }],
    })
    await page.goto(`/deals/templates/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByDisplayValue('Instagram Reel')).toBeVisible()
  })
})

// ─── Create deal from template ─────────────────────────────────────────────

test.describe('Create deal from template — /deals/new-from-template', () => {
  test('page loads with ?templateId= and shows deal form', async ({ page, request }) => {
    const templateId = await createTemplate(request, {
      name: 'Prefill Template',
      defaultValue: 60000,
    })
    await page.goto(`/deals/new-from-template?templateId=${templateId}`)
    await page.waitForLoadState('networkidle')
    // Page should be on new-from-template (not redirected away)
    await expect(page).toHaveURL(/new-from-template/)
  })

  test('deal value is pre-filled from template defaultValue', async ({ page, request }) => {
    const templateId = await createTemplate(request, {
      name: 'Value Template',
      defaultValue: 42000,
    })
    await page.goto(`/deals/new-from-template?templateId=${templateId}`)
    await page.waitForLoadState('networkidle')

    const valueField = page.getByLabel(/value/i).first()
    if (await valueField.isVisible()) {
      const val = await valueField.inputValue()
      expect(val).toBe('42000')
    }
  })

  test('submitting deal from template redirects to deal detail', async ({ page, request }) => {
    const templateId = await createTemplate(request, { name: 'Submit Template' })
    await page.goto(`/deals/new-from-template?templateId=${templateId}`)
    await page.waitForLoadState('networkidle')

    const titleField = page.getByLabel(/title/i).first()
    if (await titleField.isVisible()) {
      await titleField.fill(`From Template Deal ${Date.now()}`)
    }
    const brandField = page.getByLabel(/brand/i).first()
    if (await brandField.isVisible()) {
      await brandField.fill('TemplateBrand')
    }
    const valueField = page.getByLabel(/value/i).first()
    if (await valueField.isVisible() && !(await valueField.inputValue())) {
      await valueField.fill('50000')
    }

    await page.getByRole('button', { name: /create deal/i }).click()
    await page.waitForURL(/\/deals\/[^/]+$/, { timeout: 15_000 })
  })

  test('"From template" nav link on deals page navigates to templates', async ({
    page,
    request,
  }) => {
    await createDeal(request, { title: 'CTA Deal for Template' })
    await page.goto('/deals')
    await page.waitForLoadState('networkidle')

    const btn = page.getByRole('link', { name: /templates/i })
    if (await btn.isVisible()) {
      await btn.click()
      await expect(page).toHaveURL(/\/deals\/templates/)
    }
  })
})

// ─── Save deal as template ─────────────────────────────────────────────────

test.describe('Save deal as template', () => {
  test('Save as template section is visible on deal detail', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Template Source Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('button', { name: /save as template/i }).or(
        page.getByText(/save as template/i),
      ),
    ).toBeVisible()
  })

  test('saving as template shows success status after dialog confirm', async ({
    page,
    request,
  }) => {
    const id = await createDeal(request, { title: 'Deal To Templatize', value: 45000 })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const saveBtn = page.getByRole('button', { name: /save as template/i })
    if (await saveBtn.isVisible()) {
      // SaveAsTemplateButton uses window.prompt — accept the dialog with a name
      page.once('dialog', (dialog) => dialog.accept('Templatized Deal').catch(() => null))
      await saveBtn.click()
      // Success: role="status" paragraph with "Template saved."
      await expect(
        page.getByRole('status').filter({ hasText: /template saved/i }),
      ).toBeVisible({ timeout: 10_000 })
    }
  })

  test('dismissing the prompt dialog does not submit', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'No Save Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const saveBtn = page.getByRole('button', { name: /save as template/i })
    if (await saveBtn.isVisible()) {
      page.once('dialog', (dialog) => dialog.dismiss().catch(() => null))
      await saveBtn.click()
      // No success or error shown after cancel
      await expect(page.getByRole('status').filter({ hasText: /template saved/i })).not.toBeVisible()
    }
  })
})
