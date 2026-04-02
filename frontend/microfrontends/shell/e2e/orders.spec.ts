import { test, expect, navigateTo } from './fixtures'

test.describe('Orders Page (remote-orders)', () => {
  test('should load orders page', async ({ page }) => {
    await navigateTo(page, 'Pedidos')
    await expect(page).toHaveURL(/.*orders/)
  })

  test('should display orders or empty state', async ({ page }) => {
    await navigateTo(page, 'Pedidos')
    await page.waitForTimeout(3_000)

    const hasContent = await page.locator('table').first().isVisible().catch(() => false)
    const hasCards = await page.locator('[class*="card"]').first().isVisible().catch(() => false)
    const hasEmpty = await page.getByText('Nenhum').first().isVisible().catch(() => false)
    expect(hasContent || hasCards || hasEmpty).toBeTruthy()
  })

  test('admin should see action buttons', async ({ page }) => {
    await navigateTo(page, 'Pedidos')
    await page.waitForTimeout(3_000)

    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })
})
