import { test, expect } from '@playwright/test'

/**
 * Smoke tests for production (fastmeals.com.br)
 * Run with: PLAYWRIGHT_BASE_URL=https://fastmeals.com.br npx playwright test e2e/smoke.spec.ts
 */

const PROD_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://fastmeals.com.br'

test.describe('Production Smoke Tests', () => {
  test('should load login page', async ({ page }) => {
    await page.goto(PROD_URL)
    await expect(page.locator('text=Entrar, text=Login, text=FastMeals').first()).toBeVisible({ timeout: 15_000 })
  })

  test('should login and see dashboard', async ({ page }) => {
    await page.goto(PROD_URL)
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10_000 })
    await page.fill('input[type="email"], input[name="email"]', 'admin@fastmeals.com')
    await page.fill('input[type="password"], input[name="password"]', 'Admin@123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/', { timeout: 15_000 })
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10_000 })
  })

  test('should load all microfrontend pages', async ({ page }) => {
    // Login first
    await page.goto(PROD_URL)
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10_000 })
    await page.fill('input[type="email"], input[name="email"]', 'admin@fastmeals.com')
    await page.fill('input[type="password"], input[name="password"]', 'Admin@123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/', { timeout: 15_000 })

    // Navigate to each page
    const pages = [
      { nav: 'Pedidos', url: /orders/, content: 'Pedidos' },
      { nav: 'Produtos', url: /products/, content: 'Produtos' },
      { nav: 'Entregadores', url: /delivery/, content: 'Entregadores' },
      { nav: 'Relatórios', url: /reports/, content: 'Relatórios' },
    ]

    for (const p of pages) {
      await page.click(`text=${p.nav}`)
      await expect(page).toHaveURL(p.url, { timeout: 10_000 })
      await expect(page.locator(`text=${p.content}`).first()).toBeVisible({ timeout: 15_000 })
    }
  })

  test('should get 200 from API health', async ({ request }) => {
    const response = await request.get('https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com/health')
    expect(response.status()).toBe(200)
  })
})
