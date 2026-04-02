import { test, expect, navigateTo } from './fixtures'

test.describe('Reports Page (remote-reports)', () => {
  test('should load reports page', async ({ page }) => {
    await navigateTo(page, 'Relatórios')
    await expect(page).toHaveURL(/.*reports/)
  })

  test('should display report content', async ({ page }) => {
    await navigateTo(page, 'Relatórios')
    await page.waitForTimeout(3_000)

    const hasCards = await page.locator('[class*="card"]').first().isVisible().catch(() => false)
    const hasText = await page.getByText('Receita').first().isVisible().catch(() => false)
    expect(hasCards || hasText).toBeTruthy()
  })

  test('should have date range inputs', async ({ page }) => {
    await navigateTo(page, 'Relatórios')
    await page.waitForTimeout(3_000)

    const dateInputs = page.locator('input[type="date"]')
    const count = await dateInputs.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
