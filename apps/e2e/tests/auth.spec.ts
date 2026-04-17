/**
 * Auth flows: login, logout, register, session guard, credential validation.
 * All tests in this file run WITHOUT the saved auth cookie.
 */
import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

// ─── Login page structure ──────────────────────────────────────────────────

test.describe('Login page — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('has email and password inputs', async ({ page }) => {
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
  })

  test('Sign in button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('has link to /register', async ({ page }) => {
    const signUp = page.getByRole('link', { name: /sign up/i })
    await expect(signUp).toBeVisible()
    await expect(signUp).toHaveAttribute('href', '/register')
  })

  test('inputs have autocomplete hints', async ({ page }) => {
    await expect(page.locator('#login-email')).toHaveAttribute('autocomplete', 'email')
    await expect(page.locator('#login-password')).toHaveAttribute('autocomplete', 'current-password')
  })

  test('page title is "Log in"', async ({ page }) => {
    await expect(page).toHaveTitle(/log in/i)
  })
})

// ─── Login validation ──────────────────────────────────────────────────────

test.describe('Login page — validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('empty submit shows error message', async ({ page }) => {
    await page.click('button:has-text("Sign in")')
    await expect(page.getByRole('alert')).toContainText(/enter your email and password/i)
  })

  test('email-only submit shows error', async ({ page }) => {
    await page.fill('#login-email', 'user@example.com')
    await page.click('button:has-text("Sign in")')
    await expect(page.getByRole('alert')).toContainText(/enter your email and password/i)
  })

  test('password-only submit shows error', async ({ page }) => {
    await page.fill('#login-password', 'secret')
    await page.click('button:has-text("Sign in")')
    await expect(page.getByRole('alert')).toContainText(/enter your email and password/i)
  })

  test('wrong credentials shows error and stays on login', async ({ page }) => {
    await page.fill('#login-email', 'nobody@example.com')
    await page.fill('#login-password', 'wrongpassword')
    await page.click('button:has-text("Sign in")')
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('error clears when user edits email', async ({ page }) => {
    await page.click('button:has-text("Sign in")')
    await expect(page.getByRole('alert')).toBeVisible()
    await page.locator('#login-email').pressSequentially('a')
    await expect(page.getByRole('alert')).not.toBeVisible()
  })

  test('error clears when user edits password', async ({ page }) => {
    await page.click('button:has-text("Sign in")')
    await expect(page.getByRole('alert')).toBeVisible()
    await page.locator('#login-password').pressSequentially('x')
    await expect(page.getByRole('alert')).not.toBeVisible()
  })

  test('Enter in email field focuses password field', async ({ page }) => {
    await page.fill('#login-email', 'test@example.com')
    await page.locator('#login-email').press('Enter')
    await expect(page.locator('#login-password')).toBeFocused()
  })

  test('Enter in password field submits the form', async ({ page }) => {
    await page.fill('#login-email', 'nobody@example.com')
    await page.fill('#login-password', 'wrongpassword')
    await page.locator('#login-password').press('Enter')
    // Either error appears or redirect happens — confirm no infinite hang
    await expect(page.getByRole('alert').or(page.getByRole('heading'))).toBeVisible({
      timeout: 10_000,
    })
  })

  test('Sign in button disables during submission', async ({ page }) => {
    await page.fill('#login-email', 'test@example.com')
    await page.fill('#login-password', 'test')
    // Intercept the request to keep it hanging so we can check the disabled state
    await page.route('**/api/v1/auth/login', (route) => {
      // Don't fulfill — let the button stay disabled briefly
      setTimeout(() => route.continue(), 3000)
    })
    await page.click('button:has-text("Sign in")')
    await expect(page.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })
})

// ─── Auth guard (unauthenticated redirects) ────────────────────────────────

test.describe('Auth guard — unauthenticated redirects', () => {
  const protectedRoutes = ['/dashboard', '/deals', '/deals/new', '/attention', '/settings', '/admin']

  for (const route of protectedRoutes) {
    test(`${route} redirects to /login`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
    })
  }

  test('redirect preserves ?from= query param', async ({ page }) => {
    await page.goto('/deals')
    await expect(page).toHaveURL(/from=/, { timeout: 10_000 })
  })
})

// ─── Register page ─────────────────────────────────────────────────────────

test.describe('Register page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('shows registration form inputs', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i).first()).toBeVisible()
  })

  test('has link back to login', async ({ page }) => {
    await expect(page.getByRole('link', { name: /sign in|log in/i })).toBeVisible()
  })

  test('page title contains register or sign up', async ({ page }) => {
    await expect(page).toHaveTitle(/register|sign up/i)
  })
})
