/**
 * Auth setup: register a persistent E2E test user (or reuse if already exists),
 * then save the session cookie so all other test files start pre-authenticated.
 *
 * Strategy: try login → if 401, register → verify /me → save storageState.
 * This works on first run (no user yet) and on subsequent runs (user exists).
 */
import { test as setup, expect } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

const authFile = 'playwright/.auth/user.json'
const API = process.env['E2E_API_URL'] ?? 'http://localhost:3001'

export const E2E_EMAIL = process.env['E2E_USER_EMAIL'] ?? 'e2e-test@oompa.test'
export const E2E_PASSWORD = process.env['E2E_USER_PASSWORD'] ?? 'E2eTestPass1!'

setup('authenticate', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  // 1. Try login with the fixed test credentials
  const loginRes = await page.request.post(`${API}/api/v1/auth/login`, {
    data: { email: E2E_EMAIL, password: E2E_PASSWORD },
  })

  if (!loginRes.ok()) {
    // 2. User doesn't exist yet — register it
    const registerRes = await page.request.post(`${API}/api/v1/auth/register`, {
      data: { email: E2E_EMAIL, password: E2E_PASSWORD },
    })
    expect(
      registerRes.ok(),
      `Setup: registration failed ${registerRes.status()} — ${await registerRes.text()}`,
    ).toBe(true)
  }

  // 3. Confirm we're authenticated
  const meRes = await page.request.get(`${API}/api/v1/auth/me`)
  expect(meRes.ok(), `Setup: /auth/me failed ${meRes.status()}`).toBe(true)

  // 4. Persist the session cookie for all other test files
  await page.context().storageState({ path: authFile })
})
