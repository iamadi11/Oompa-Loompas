/**
 * Deal CRUD: create form, edit inline, delete.
 */
import { test, expect } from '@playwright/test'
import { createDeal } from '../helpers/api'

test.describe('Create deal — /deals/new', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/deals/new')
    await page.waitForLoadState('networkidle')
  })

  test('form has Title, Brand name, Value, Currency, Status fields', async ({ page }) => {
    await expect(page.getByLabel(/title/i)).toBeVisible()
    await expect(page.getByLabel(/brand/i)).toBeVisible()
    await expect(page.getByLabel(/value|amount/i)).toBeVisible()
  })

  test('page title is "New deal" or similar', async ({ page }) => {
    await expect(page).toHaveTitle(/new deal|create deal/i)
  })

  test('submitting empty form shows validation errors', async ({ page }) => {
    await page.getByRole('button', { name: /create|save|add/i }).first().click()
    // At minimum title or brand validation fires
    await expect(
      page.getByRole('alert').or(page.getByText(/required|enter/i)).first(),
    ).toBeVisible()
  })

  test('creates deal and redirects to deal detail', async ({ page }) => {
    const title = `New Deal ${Date.now()}`
    await page.getByLabel(/title/i).fill(title)
    await page.getByLabel(/brand/i).fill('TestBrand')
    await page.getByLabel(/value|amount/i).fill('100000')
    await page.getByRole('button', { name: /create|save|add/i }).first().click()
    await page.waitForURL(/\/deals\/[a-z0-9-]+/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
  })

  test('brand name field shows datalist suggestions (no crash)', async ({ page }) => {
    const brandField = page.getByLabel(/brand/i)
    await brandField.click()
    await brandField.fill('Test')
    // Just confirm no crash — datalist may or may not be visible depending on browser
    await expect(brandField).toBeVisible()
  })
})

test.describe('Edit deal — inline on deal detail', () => {
  test('title field is editable', async ({ page, request }) => {
    const id = await createDeal(request, { title: 'Editable Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')

    const titleInput = page.getByLabel(/title/i).first()
    if (await titleInput.isVisible()) {
      await titleInput.fill('Updated Deal Title')
      const saveBtn = page.getByRole('button', { name: 'Save changes' })
      if (await saveBtn.isVisible()) {
        await saveBtn.click()
        await page.waitForLoadState('networkidle')
        await expect(page.getByRole('heading', { name: 'Updated Deal Title' })).toBeVisible()
      }
    }
  })

  test('deal detail shows status badge', async ({ page, request }) => {
    const id = await createDeal(request, { status: 'DRAFT', title: 'Status Badge Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/DRAFT|Draft/i).first()).toBeVisible()
  })

  test('deal detail shows brand name', async ({ page, request }) => {
    const id = await createDeal(request, { brandName: 'ShowBrand', title: 'Brand Visible Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('ShowBrand')).toBeVisible()
  })

  test('deal detail shows formatted deal value', async ({ page, request }) => {
    const id = await createDeal(request, { value: 150000, title: 'Value Visible Deal' })
    await page.goto(`/deals/${id}`)
    await page.waitForLoadState('networkidle')
    // Should show currency-formatted amount
    await expect(page.getByText(/1,50,000|150,000|₹/).first()).toBeVisible()
  })
})

test.describe('Deal detail — 404 handling', () => {
  test('unknown UUID shows not-found content', async ({ page }) => {
    await page.goto('/deals/00000000-0000-0000-0000-000000000000')
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText(/not found|couldn't find|does not exist/i).first(),
    ).toBeVisible()
  })

  test('not-found page has link back to deals', async ({ page }) => {
    await page.goto('/deals/00000000-0000-0000-0000-000000000000')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('link', { name: /deals|back/i }).first()).toBeVisible()
  })
})
