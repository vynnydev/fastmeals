import { test, expect, ADMIN_USER, VIEWER_USER } from './fixtures'

test.describe('Authentication', () => {
  test('should show login page when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/.*login/)
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('should display login form elements', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'FastMeals' })).toBeVisible()
    await expect(page.getByText('Sistema de Gestão de Pedidos e Entregas')).toBeVisible()
  })

  test('should login with admin credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', ADMIN_USER.email)
    await page.fill('#password', ADMIN_USER.password)
    await page.getByRole('button', { name: 'Entrar' }).click()

    await page.waitForURL('/', { timeout: 15_000 })
    await expect(page).not.toHaveURL(/.*login/)
    await expect(page.locator('[class*="card"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('should login with viewer credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', VIEWER_USER.email)
    await page.fill('#password', VIEWER_USER.password)
    await page.getByRole('button', { name: 'Entrar' }).click()

    await page.waitForURL('/', { timeout: 15_000 })
    await expect(page).not.toHaveURL(/.*login/)
    await expect(page.locator('[class*="card"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('should fail login with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'wrong@email.com')
    await page.fill('#password', 'WrongPass123')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByText('Credenciais inválidas')).toBeVisible({ timeout: 10_000 })
    await expect(page).toHaveURL(/.*login/)
  })

  test('should show remember me checkbox', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Lembrar-me')).toBeVisible()
  })

  test('should show forgot password link', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Esqueceu a senha?')).toBeVisible()
  })
})
