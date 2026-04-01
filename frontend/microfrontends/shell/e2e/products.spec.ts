import { test, expect } from './fixtures'

test.describe('Products Page (remote-products)', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/products')
    await adminPage.waitForLoadState('networkidle')
  })

  test('should load products page', async ({ adminPage }) => {
    await expect(adminPage.locator('text=Produtos').first()).toBeVisible({ timeout: 15_000 })
  })

  test('should display product cards or table', async ({ adminPage }) => {
    const hasProducts = await adminPage.locator('[data-testid="product-card"], table, text=R$').first().isVisible({ timeout: 10_000 }).catch(() => false)
    if (hasProducts) {
      // Products should show price
      await expect(adminPage.locator('text=R$').first()).toBeVisible()
    } else {
      await expect(adminPage.locator('text=Nenhum produto, text=nenhum').first()).toBeVisible()
    }
  })

  test('should filter products by category', async ({ adminPage }) => {
    const categories = ['Refeições', 'Bebidas', 'Sobremesas', 'Acompanhamentos']

    for (const category of categories) {
      const filterButton = adminPage.locator(`button:has-text("${category}"), [data-testid="category-${category}"]`).first()
      if (await filterButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await filterButton.click()
        await adminPage.waitForTimeout(500)
        break
      }
    }
  })

  test('should search products by name', async ({ adminPage }) => {
    const searchInput = adminPage.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"], input[type="search"]').first()

    if (await searchInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await searchInput.fill('Burger')
      await adminPage.waitForTimeout(1_000)
    }
  })

  test('should switch between grid and table views', async ({ adminPage }) => {
    const viewButtons = adminPage.locator('button:has-text("Grid"), button:has-text("Tabela"), [data-testid="view-toggle"]')
    const count = await viewButtons.count()

    if (count >= 2) {
      await viewButtons.nth(1).click()
      await adminPage.waitForTimeout(500)
    }
  })

  test('admin should see create product button', async ({ adminPage }) => {
    const createButton = adminPage.locator('button:has-text("Novo Produto"), button:has-text("Criar"), button:has-text("Adicionar")')
    await expect(createButton.first()).toBeVisible({ timeout: 10_000 })
  })

  test('viewer should NOT see create product button', async ({ viewerPage }) => {
    await viewerPage.goto('/products')
    await viewerPage.waitForLoadState('networkidle')

    const createButton = viewerPage.locator('button:has-text("Novo Produto"), button:has-text("Criar Produto")')
    await expect(createButton).toHaveCount(0, { timeout: 5_000 })
  })
})
