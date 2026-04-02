import { chromium, type FullConfig } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5000'

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Login as admin
  await page.goto(`${baseURL}/login`)
  await page.waitForSelector('#email', { timeout: 10_000 })
  await page.fill('#email', 'admin@fastmeals.com')
  await page.fill('#password', 'Admin@123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/', { timeout: 15_000 })
  await page.waitForLoadState('networkidle')

  // Save admin auth state
  await page.context().storageState({ path: 'e2e/.auth/admin.json' })
  await browser.close()

  // Login as viewer
  const browser2 = await chromium.launch()
  const page2 = await browser2.newPage()

  await page2.goto(`${baseURL}/login`)
  await page2.waitForSelector('#email', { timeout: 10_000 })
  await page2.fill('#email', 'viewer@fastmeals.com')
  await page2.fill('#password', 'Viewer@123')
  await page2.getByRole('button', { name: 'Entrar' }).click()
  await page2.waitForURL('**/', { timeout: 15_000 })
  await page2.waitForLoadState('networkidle')

  // Save viewer auth state
  await page2.context().storageState({ path: 'e2e/.auth/viewer.json' })
  await browser2.close()
}

export default globalSetup
