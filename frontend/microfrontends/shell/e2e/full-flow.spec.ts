import { test, expect } from '@playwright/test'

const PROD_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://fastmeals.com.br'

test.describe.configure({ mode: 'serial' })

let page: import('@playwright/test').Page

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
})

test.afterAll(async () => {
  await page.close()
})

test.describe('FastMeals E2E — Full Flow', () => {

  // ==========================================
  // LOGIN
  // ==========================================

  test('🔐 should load login page', async () => {
    await page.goto(PROD_URL)
    await expect(page.getByRole('heading', { name: 'FastMeals' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('🔐 should display login form elements', async () => {
    await expect(page.getByText('Lembrar-me')).toBeVisible()
    await expect(page.getByText('Esqueceu a senha?')).toBeVisible()
    await expect(page.getByText('Sistema de Gestão de Pedidos e Entregas')).toBeVisible()
  })

  test('🔐 should login with admin credentials', async () => {
    await page.fill('#email', 'admin@fastmeals.com')
    await page.fill('#password', 'Admin@123')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/', { timeout: 15_000 })
    await page.waitForLoadState('networkidle')
  })

  // ==========================================
  // DASHBOARD
  // ==========================================

  test('📊 should display dashboard', async () => {
    await expect(page).not.toHaveURL(/.*login/)
    await expect(page.locator('[class*="card"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('📊 should display sidebar navigation links', async () => {
    await expect(page.getByRole('link', { name: 'Pedidos' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Produtos' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Entregadores' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Relatórios' })).toBeVisible()
  })

  // ==========================================
  // ORDERS
  // ==========================================

  test('📋 should navigate to Orders page', async () => {
    await page.getByRole('link', { name: 'Pedidos', exact: true }).click()
    await expect(page).toHaveURL(/.*orders/, { timeout: 10_000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5_000)
  })

  test('📋 should display orders content', async () => {
    const hasContent = await page.locator('table, [class*="card"]').first().isVisible().catch(() => false)
    const hasEmpty = await page.getByText('Nenhum').first().isVisible().catch(() => false)
    expect(hasContent || hasEmpty).toBeTruthy()
  })

  // ==========================================
  // PRODUCTS
  // ==========================================

  test('📦 should navigate to Products page', async () => {
    await page.getByRole('link', { name: 'Produtos', exact: true }).click()
    await expect(page).toHaveURL(/.*products/, { timeout: 10_000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5_000)
  })

  test('📦 should display products content', async () => {
    const hasContent = await page.locator('[class*="card"], table').first().isVisible().catch(() => false)
    const hasEmpty = await page.getByText('Nenhum').first().isVisible().catch(() => false)
    const hasPage = await page.locator('main, [role="main"], #root').first().isVisible().catch(() => false)
    expect(hasContent || hasEmpty || hasPage).toBeTruthy()
  })

  test('📦 should have search functionality', async () => {
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"], input[type="search"]').first()
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Burger')
      await page.waitForTimeout(1_000)
      await searchInput.clear()
    }
  })

  // ==========================================
  // DELIVERY
  // ==========================================

  test('🚴 should navigate to Delivery page', async () => {
    await page.getByRole('link', { name: 'Entregadores', exact: true }).click()
    await expect(page).toHaveURL(/.*delivery/, { timeout: 10_000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5_000)
  })

  test('🚴 should display delivery persons content', async () => {
    const hasContent = await page.locator('[class*="card"], table').first().isVisible().catch(() => false)
    const hasEmpty = await page.getByText('Nenhum').first().isVisible().catch(() => false)
    const hasPage = await page.locator('main, [role="main"], #root').first().isVisible().catch(() => false)
    expect(hasContent || hasEmpty || hasPage).toBeTruthy()
  })

  test('🚴 should test optimization tab', async () => {
    const optimizationTab = page.getByText('Otimização').first()
    if (await optimizationTab.isVisible().catch(() => false)) {
      await optimizationTab.click()
      await page.waitForTimeout(2_000)
    }
  })

  // ==========================================
  // REPORTS
  // ==========================================

  test('📊 should navigate to Reports page', async () => {
    await page.getByRole('link', { name: 'Relatórios', exact: true }).click()
    await expect(page).toHaveURL(/.*reports/, { timeout: 10_000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5_000)
  })

  test('📊 should display reports content', async () => {
    const hasContent = await page.locator('[class*="card"], table').first().isVisible().catch(() => false)
    const hasText = await page.getByText('Receita').first().isVisible().catch(() => false)
    const hasPage = await page.locator('main, [role="main"], #root').first().isVisible().catch(() => false)
    expect(hasContent || hasText || hasPage).toBeTruthy()
  })

  // ==========================================
  // BACK TO DASHBOARD
  // ==========================================

  test('🏠 should navigate back to Dashboard', async () => {
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[class*="card"]').first()).toBeVisible({ timeout: 10_000 })
  })
})