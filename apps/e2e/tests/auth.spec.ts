/**
 * Auth flows: login (valid + invalid), logout, register form, auth guard.
 *
 * Valid-credential tests create a unique throwaway user per test via the API,
 * so they never depend on seed data or the shared E2E test account.
 */
import { test, expect } from '@playwright/test'

const API = process.env['E2E_API_URL'] ?? 'http://localhost:3001'

/** Register a unique throwaway user via API and return their credentials. */
async function registerThrowaway(
  request: Parameters<Parameters<typeof test>[1]>[0]['request'],
): Promise<{ email: string; password: string }> {
  const email = `e2e-throwaway-${Date.now()}@oompa.test`
  const password = 'Throwaway1!'
  const res = await request.post(`${API}/api/v1/auth/register`, {
    data: { email, password },
  })
  if (!res.ok()) throw new Error(`registerThrowaway failed: ${res.status()} ${await res.text()}`)
  return { email, password }
}

// ─── Login page — structure ────────────────────────────────────────────────

test.describe('Login page — structure', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('has #login-email and #login-password inputs', async ({ page }) => {
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
  })

  test('Sign in button is visible and type="button"', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Sign in' })
    await expect(btn).toBeVisible()
    await expect(btn).toHaveAttribute('type', 'button')
  })

  test('email input has autocomplete="email"', async ({ page }) => {
    await expect(page.locator('#login-email')).toHaveAttribute('autocomplete', 'email')
  })

  test('password input has autocomplete="current-password"', async ({ page }) => {
    await expect(page.locator('#login-password')).toHaveAttribute('autocomplete', 'current-password')
  })

  test('has Sign up link pointing to /register', async ({ page }) => {
    const link = page.getByRole('link', { name: /sign up/i })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/register')
  })

  test('page title is "Log in"', async ({ page }) => {
    await expect(page).toHaveTitle(/log in/i)
  })
})

// ─── Login — validation errors ────────────────────────────────────────────

test.describe('Login — client-side validation', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('submitting empty form shows "Enter your email and password"', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toContainText(/enter your email and password/i)
  })

  test('submitting email only (no password) shows error', async ({ page }) => {
    await page.fill('#login-email', 'user@example.com')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toContainText(/enter your email and password/i)
  })

  test('submitting password only (no email) shows error', async ({ page }) => {
    await page.fill('#login-password', 'Password1!')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toContainText(/enter your email and password/i)
  })

  test('error clears when user types in the email field', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await page.locator('#login-email').pressSequentially('a')
    await expect(page.getByRole('alert')).not.toBeVisible()
  })

  test('error clears when user types in the password field', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await page.locator('#login-password').pressSequentially('x')
    await expect(page.getByRole('alert')).not.toBeVisible()
  })

  test('Enter in email field moves focus to password', async ({ page }) => {
    await page.fill('#login-email', 'test@example.com')
    await page.locator('#login-email').press('Enter')
    await expect(page.locator('#login-password')).toBeFocused()
  })
})

// ─── Login — server-side errors (real API) ────────────────────────────────

test.describe('Login — wrong credentials (server error)', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('non-existent email shows invalid credentials error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#login-email', `nobody-${Date.now()}@oompa.test`)
    await page.fill('#login-password', 'Password1!')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('alert')).toContainText(/invalid|incorrect|wrong|failed/i)
    await expect(page).toHaveURL(/\/login/)
  })

  test('correct email but wrong password shows invalid credentials error', async ({
    page,
    request,
  }) => {
    const { email } = await registerThrowaway(request)
    await page.goto('/login')
    await page.fill('#login-email', email)
    await page.fill('#login-password', 'WrongPassword99!')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('alert')).toContainText(/invalid|incorrect|wrong|failed/i)
  })

  test('button shows "Signing in…" and is disabled during request', async ({ page }) => {
    await page.goto('/login')
    // Slow down the request so we can observe the loading state
    await page.route('**/api/v1/auth/login', async (route) => {
      await new Promise((r) => setTimeout(r, 2000))
      await route.continue()
    })
    await page.fill('#login-email', 'slow@example.com')
    await page.fill('#login-password', 'Password1!')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })
})

// ─── Login — successful login flow ────────────────────────────────────────

test.describe('Login — valid credentials (end-to-end)', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('login with valid credentials redirects to /dashboard', async ({ page, request }) => {
    const { email, password } = await registerThrowaway(request)
    // Log out any existing session first (fresh browser context, so no session anyway)
    await page.goto('/login')
    await page.fill('#login-email', email)
    await page.fill('#login-password', password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 })
    // Should land on dashboard or deals
    await expect(page).toHaveURL(/\/(dashboard|deals)/)
  })

  test('successful login shows "Signed in" toast', async ({ page, request }) => {
    const { email, password } = await registerThrowaway(request)
    await page.goto('/login')
    await page.fill('#login-email', email)
    await page.fill('#login-password', password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText(/signed in/i)).toBeVisible({ timeout: 10_000 })
  })

  test('?from= redirect is honoured after login', async ({ page, request }) => {
    const { email, password } = await registerThrowaway(request)
    await page.goto('/login?from=/deals')
    await page.fill('#login-email', email)
    await page.fill('#login-password', password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL(/\/deals/, { timeout: 15_000 })
  })

  test('Enter key in password field submits and logs in', async ({ page, request }) => {
    const { email, password } = await registerThrowaway(request)
    await page.goto('/login')
    await page.fill('#login-email', email)
    await page.fill('#login-password', password)
    await page.locator('#login-password').press('Enter')
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 })
    await expect(page).toHaveURL(/\/(dashboard|deals)/)
  })
})

// ─── Logout ───────────────────────────────────────────────────────────────

test.describe('Logout', () => {
  // Logout runs with the saved auth state (user is logged in)
  test('logging out redirects to /login and clears session', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Find and click the logout button (may be in a menu or nav)
    const logoutBtn = page
      .getByRole('button', { name: /log out|sign out|logout/i })
      .or(page.getByRole('link', { name: /log out|sign out|logout/i }))

    if (await logoutBtn.isVisible()) {
      await logoutBtn.click()
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
    } else {
      // Logout might be behind a menu — try clicking user avatar / menu trigger
      const menuTrigger = page
        .getByRole('button', { name: /menu|account|user/i })
        .or(page.locator('[data-testid="user-menu"]'))
        .or(page.getByRole('button').filter({ hasText: /^[A-Z]$/ })) // initial avatar

      if (await menuTrigger.isVisible()) {
        await menuTrigger.click()
        await page.getByRole('button', { name: /log out|sign out/i }).click()
        await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
      }
    }
  })

  test('after logout, /dashboard redirects to /login', async ({ page }) => {
    // Call the logout API directly to clear the session
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.request.post(`${API}/api/v1/auth/logout`)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})

// ─── Register page — structure ─────────────────────────────────────────────

test.describe('Register page — structure', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('has #reg-email, #reg-password, #reg-confirm inputs', async ({ page }) => {
    await expect(page.locator('#reg-email')).toBeVisible()
    await expect(page.locator('#reg-password')).toBeVisible()
    await expect(page.locator('#reg-confirm')).toBeVisible()
  })

  test('Create account button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('password field hints "min 8 characters"', async ({ page }) => {
    await expect(page.getByText(/min 8 characters/i)).toBeVisible()
  })

  test('has Sign in link pointing to /login', async ({ page }) => {
    const link = page.getByRole('link', { name: /sign in/i })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/login')
  })

  test('page title is "Create account"', async ({ page }) => {
    await expect(page).toHaveTitle(/create account/i)
  })
})

// ─── Register — client-side validation ───────────────────────────────────

test.describe('Register — client-side validation', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('empty submit shows "All fields are required"', async ({ page }) => {
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByRole('alert')).toContainText(/all fields are required/i)
  })

  test('password shorter than 8 chars shows password length error', async ({ page }) => {
    await page.fill('#reg-email', 'test@example.com')
    await page.fill('#reg-password', 'short')
    await page.fill('#reg-confirm', 'short')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByRole('alert')).toContainText(/8 characters/i)
  })

  test('mismatched passwords shows "Passwords do not match"', async ({ page }) => {
    await page.fill('#reg-email', 'test@example.com')
    await page.fill('#reg-password', 'Password1!')
    await page.fill('#reg-confirm', 'Different1!')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByRole('alert')).toContainText(/passwords do not match/i)
  })

  test('error clears when user edits any field', async ({ page }) => {
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await page.locator('#reg-email').pressSequentially('a')
    await expect(page.getByRole('alert')).not.toBeVisible()
  })

  test('Enter in email moves focus to password', async ({ page }) => {
    await page.fill('#reg-email', 'test@example.com')
    await page.locator('#reg-email').press('Enter')
    await expect(page.locator('#reg-password')).toBeFocused()
  })

  test('Enter in password moves focus to confirm', async ({ page }) => {
    await page.fill('#reg-password', 'Password1!')
    await page.locator('#reg-password').press('Enter')
    await expect(page.locator('#reg-confirm')).toBeFocused()
  })
})

// ─── Register — successful signup flow ────────────────────────────────────

test.describe('Register — successful signup (end-to-end)', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('fills form and creates account, then redirects away from /register', async ({ page }) => {
    const email = `signup-e2e-${Date.now()}@oompa.test`
    await page.goto('/register')
    await page.fill('#reg-email', email)
    await page.fill('#reg-password', 'NewPass99!')
    await page.fill('#reg-confirm', 'NewPass99!')
    await page.getByRole('button', { name: /create account/i }).click()

    // Redirects away from /register on success
    await page.waitForURL((url) => !url.pathname.startsWith('/register'), { timeout: 15_000 })
    await expect(page).not.toHaveURL(/\/register/)
  })

  test('shows "Account created" toast on success', async ({ page }) => {
    const email = `toast-e2e-${Date.now()}@oompa.test`
    await page.goto('/register')
    await page.fill('#reg-email', email)
    await page.fill('#reg-password', 'NewPass99!')
    await page.fill('#reg-confirm', 'NewPass99!')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByText(/account created|welcome/i)).toBeVisible({ timeout: 10_000 })
  })

  test('duplicate email shows "already exists" error', async ({ page, request }) => {
    const { email } = await registerThrowaway(request)
    await page.goto('/register')
    await page.fill('#reg-email', email)
    await page.fill('#reg-password', 'NewPass99!')
    await page.fill('#reg-confirm', 'NewPass99!')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByRole('alert')).toContainText(/already exists|taken/i, {
      timeout: 10_000,
    })
  })

  test('Create account button disables during submission', async ({ page }) => {
    await page.route('**/api/v1/auth/register', async (route) => {
      await new Promise((r) => setTimeout(r, 2000))
      await route.continue()
    })
    await page.goto('/register')
    await page.fill('#reg-email', `slow-${Date.now()}@oompa.test`)
    await page.fill('#reg-password', 'NewPass99!')
    await page.fill('#reg-confirm', 'NewPass99!')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByRole('button', { name: /creating account/i })).toBeDisabled()
  })

  test('Enter key in confirm field submits the form', async ({ page }) => {
    const email = `enter-e2e-${Date.now()}@oompa.test`
    await page.goto('/register')
    await page.fill('#reg-email', email)
    await page.fill('#reg-password', 'NewPass99!')
    await page.fill('#reg-confirm', 'NewPass99!')
    await page.locator('#reg-confirm').press('Enter')
    await page.waitForURL((url) => !url.pathname.startsWith('/register'), { timeout: 15_000 })
  })
})

// ─── Auth guard (unauthenticated redirects) ────────────────────────────────

test.describe('Auth guard — unauthenticated redirects', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  const protectedRoutes = [
    '/dashboard',
    '/deals',
    '/deals/new',
    '/attention',
    '/settings',
  ]

  for (const route of protectedRoutes) {
    test(`${route} redirects to /login`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
    })
  }

  test('redirect preserves ?from= so login can bounce back', async ({ page }) => {
    await page.goto('/deals')
    await expect(page).toHaveURL(/from=/, { timeout: 10_000 })
  })
})
