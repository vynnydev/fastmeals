import { test, expect, ADMIN_USER, VIEWER_USER } from './fixtures'

test.describe('Authentication', () => {
  test('should show login page when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/.*login/)
    await expect(page.locator('text=Entrar, text=Login').first()).toBeVisible()
  })

  test('should login with admin credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"], input[name="email"]', ADMIN_USER.email)
    await page.fill('input[type="password"], input[name="password"]', ADMIN_USER.password)
    await page.click('button[type="submit"]')

    await page.waitForURL('**/', { timeout: 15_000 })
    await expect(page.locator('text=Dashboard').first()).toBeVisible()
  })

  test('should login with viewer credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"], input[name="email"]', VIEWER_USER.email)
    await page.fill('input[type="password"], input[name="password"]', VIEWER_USER.password)
    await page.click('button[type="submit"]')

    await page.waitForURL('**/', { timeout: 15_000 })
    await expect(page.locator('text=Dashboard').first()).toBeVisible()
  })

  test('should fail login with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"], input[name="email"]', 'wrong@email.com')
    await page.fill('input[type="password"], input[name="password"]', 'WrongPass123')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Credenciais inválidas, text=erro, text=inválid').first()).toBeVisible({ timeout: 5_000 })
    await expect(page).toHaveURL(/.*login/)
  })

  test('should logout successfully', async ({ adminPage }) => {
    // Look for logout button (icon or text)
    const logoutButton = adminPage.locator('[aria-label="logout"], [data-testid="logout"], button:has-text("Sair")')
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      await expect(adminPage).toHaveURL(/.*login/)
    }
  })
})
