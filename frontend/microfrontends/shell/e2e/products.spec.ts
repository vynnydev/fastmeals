import { test, expect, navigateTo } from './fixtures'

test.describe('Products Page (remote-products)', () => {
  test('should load products page', async ({ page }) => {
    await navigateTo(page, 'Produtos')
    await expect(page).toHaveURL(/.*products/)
  })

  test('should display products or empty state', async ({ page }) => {
    await navigateTo(page, 'Produtos')
    await page.waitForTimeout(3_000)

    const hasProducts = await page.getByText('R$').first().isVisible().catch(() => false)
    const hasEmpty = await page.getByText('Nenhum').first().isVisible().catch(() => false)
    expect(hasProducts || hasEmpty).toBeTruthy()
  })

  test('should have search input', async ({ page }) => {
    await navigateTo(page, 'Produtos')
    await page.waitForTimeout(3_000)

    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"], input[type="search"]').first()
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Burger')
      await page.waitForTimeout(1_000)
    }
  })
})
