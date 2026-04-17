import { test as setup, expect } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  await page.goto('/login')
  await expect(page.getByLabel('Email')).toBeVisible()

  await page.fill('#login-email', process.env['E2E_USER_EMAIL'] ?? 'admin@test.dev')
  await page.fill('#login-password', process.env['E2E_USER_PASSWORD'] ?? 'changeme')
  await page.click('button:has-text("Sign in")')

  // Wait for redirect away from login — indicates successful auth
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 })

  await page.context().storageState({ path: authFile })
})
