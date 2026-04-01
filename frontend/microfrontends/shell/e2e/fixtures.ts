import { test as base, expect, type Page } from '@playwright/test'

// ==========================================
// Test credentials
// ==========================================
export const ADMIN_USER = {
  email: 'admin@fastmeals.com',
  password: 'Admin@123',
  role: 'admin',
}

export const VIEWER_USER = {
  email: 'viewer@fastmeals.com',
  password: 'Viewer@123',
  role: 'viewer',
}

// ==========================================
// Login helper
// ==========================================
async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10_000 })
  await page.fill('input[type="email"], input[name="email"]', email)
  await page.fill('input[type="password"], input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/', { timeout: 15_000 })
  // Wait for dashboard to load
  await expect(page.locator('text=Dashboard, text=FastMeals').first()).toBeVisible({ timeout: 10_000 })
}

// ==========================================
// Custom test fixture with auto-login
// ==========================================
type TestFixtures = {
  adminPage: Page
  viewerPage: Page
}

export const test = base.extend<TestFixtures>({
  adminPage: async ({ page }, use) => {
    await login(page, ADMIN_USER.email, ADMIN_USER.password)
    await use(page)
  },
  viewerPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await login(page, VIEWER_USER.email, VIEWER_USER.password)
    await use(page)
    await context.close()
  },
})

export { expect }
