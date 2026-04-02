import { test, expect } from '@playwright/test'

const PROD_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://fastmeals.com.br'

test.describe('Production Smoke Tests', () => {
  test('should load login page', async ({ page }) => {
    await page.goto(PROD_URL)
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'FastMeals' })).toBeVisible()
  })

  test('should login and see dashboard', async ({ page }) => {
    await page.goto(PROD_URL)
    await page.waitForSelector('#email', { timeout: 10_000 })
    await page.fill('#email', 'admin@fastmeals.com')
    await page.fill('#password', 'Admin@123')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await page.waitForURL('**/', { timeout: 15_000 })
    await page.waitForLoadState('networkidle')
    // Verify we're on the dashboard (not login page)
    await expect(page).not.toHaveURL(/.*login/)
    await expect(page.locator('[class*="card"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('should load all microfrontend pages', async ({ page }) => {
    // Login
    await page.goto(PROD_URL)
    await page.waitForSelector('#email', { timeout: 10_000 })
    await page.fill('#email', 'admin@fastmeals.com')
    await page.fill('#password', 'Admin@123')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/', { timeout: 15_000 })
    await page.waitForLoadState('networkidle')

    // Navigate each page via sidebar links
    const pages = [
      { name: 'Pedidos', url: /orders/ },
      { name: 'Produtos', url: /products/ },
      { name: 'Entregadores', url: /delivery/ },
      { name: 'Relatórios', url: /reports/ },
    ]

    for (const p of pages) {
      await page.getByRole('link', { name: p.name, exact: true }).click()
      await expect(page).toHaveURL(p.url, { timeout: 10_000 })
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2_000)
    }
  })
})
