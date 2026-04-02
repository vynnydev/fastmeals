import { test, expect, navigateTo } from './fixtures'

test.describe('Dashboard', () => {
  test('should display dashboard after login', async ({ page }) => {
    await page.goto('/')
    await expect(page).not.toHaveURL(/.*login/)
    await expect(page.locator('[class*="card"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('should display sidebar navigation links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Pedidos' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Produtos' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Entregadores' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Relatórios' })).toBeVisible()
  })

  test('should navigate to orders page', async ({ page }) => {
    await page.goto('/')
    await navigateTo(page, 'Pedidos')
    await expect(page).toHaveURL(/.*orders/)
  })

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/')
    await navigateTo(page, 'Produtos')
    await expect(page).toHaveURL(/.*products/)
  })

  test('should navigate to delivery page', async ({ page }) => {
    await page.goto('/')
    await navigateTo(page, 'Entregadores')
    await expect(page).toHaveURL(/.*delivery/)
  })

  test('should navigate to reports page', async ({ page }) => {
    await page.goto('/')
    await navigateTo(page, 'Relatórios')
    await expect(page).toHaveURL(/.*reports/)
  })
})
