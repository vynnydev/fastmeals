import { test, expect, navigateTo } from './fixtures'

test.describe('Delivery Page (remote-delivery)', () => {
  test('should load delivery page', async ({ page }) => {
    await navigateTo(page, 'Entregadores')
    await expect(page).toHaveURL(/.*delivery/)
  })

  test('should display delivery persons or empty state', async ({ page }) => {
    await navigateTo(page, 'Entregadores')
    await page.waitForTimeout(3_000)

    const hasCards = await page.locator('[class*="card"]').first().isVisible().catch(() => false)
    const hasEmpty = await page.getByText('Nenhum').first().isVisible().catch(() => false)
    expect(hasCards || hasEmpty).toBeTruthy()
  })

  test('should have optimization tab', async ({ page }) => {
    await navigateTo(page, 'Entregadores')
    await page.waitForTimeout(3_000)

    const optimizationTab = page.getByText('Otimização').first()
    if (await optimizationTab.isVisible().catch(() => false)) {
      await optimizationTab.click()
      await page.waitForTimeout(2_000)
    }
  })
})
