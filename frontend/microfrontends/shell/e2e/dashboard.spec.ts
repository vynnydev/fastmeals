import { test, expect } from './fixtures'

test.describe('Dashboard', () => {
  test('should display stat cards with metrics', async ({ adminPage }) => {
    await adminPage.goto('/')

    // Stat cards should be visible
    await expect(adminPage.locator('text=Receita Total').first()).toBeVisible({ timeout: 10_000 })
    await expect(adminPage.locator('text=Total de Pedidos, text=Pedidos').first()).toBeVisible()
  })

  test('should display sidebar navigation', async ({ adminPage }) => {
    await adminPage.goto('/')

    // Sidebar links
    await expect(adminPage.locator('text=Dashboard').first()).toBeVisible()
    await expect(adminPage.locator('text=Pedidos').first()).toBeVisible()
    await expect(adminPage.locator('text=Produtos').first()).toBeVisible()
    await expect(adminPage.locator('text=Entregadores').first()).toBeVisible()
    await expect(adminPage.locator('text=Relatórios').first()).toBeVisible()
  })

  test('should display user info in sidebar', async ({ adminPage }) => {
    await adminPage.goto('/')
    await expect(adminPage.locator('text=admin@fastmeals').first()).toBeVisible({ timeout: 10_000 })
  })

  test('should navigate to orders page from sidebar', async ({ adminPage }) => {
    await adminPage.goto('/')
    await adminPage.click('text=Pedidos')
    await expect(adminPage).toHaveURL(/.*orders/)
  })

  test('should navigate to products page from sidebar', async ({ adminPage }) => {
    await adminPage.goto('/')
    await adminPage.click('text=Produtos')
    await expect(adminPage).toHaveURL(/.*products/)
  })

  test('should navigate to delivery page from sidebar', async ({ adminPage }) => {
    await adminPage.goto('/')
    await adminPage.click('text=Entregadores')
    await expect(adminPage).toHaveURL(/.*delivery/)
  })

  test('should navigate to reports page from sidebar', async ({ adminPage }) => {
    await adminPage.goto('/')
    await adminPage.click('text=Relatórios')
    await expect(adminPage).toHaveURL(/.*reports/)
  })
})
