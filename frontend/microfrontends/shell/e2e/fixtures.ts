import { test as base, expect } from '@playwright/test'

export const ADMIN_USER = {
  email: 'admin@fastmeals.com',
  password: 'Admin@123',
}

export const VIEWER_USER = {
  email: 'viewer@fastmeals.com',
  password: 'Viewer@123',
}

// Navigate via sidebar link
async function navigateTo(page: import('@playwright/test').Page, name: string) {
  await page.getByRole('link', { name, exact: true }).click()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2_000)
}

// Re-export test as-is (storageState is set in playwright.config.ts per project)
export const test = base
export { expect, navigateTo }
