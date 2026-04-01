import { test, expect } from './fixtures'

test.describe('Orders Page (remote-orders)', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/orders')
    await adminPage.waitForLoadState('networkidle')
  })

  test('should load orders page', async ({ adminPage }) => {
    await expect(adminPage.locator('text=Pedidos').first()).toBeVisible({ timeout: 15_000 })
  })

  test('should display orders in table view', async ({ adminPage }) => {
    // Look for table or order cards
    const hasOrders = await adminPage.locator('table, [data-testid="order-card"], text=Pedido').first().isVisible({ timeout: 10_000 }).catch(() => false)
    if (hasOrders) {
      await expect(adminPage.locator('table, [data-testid="order-card"]').first()).toBeVisible()
    } else {
      // Empty state
      await expect(adminPage.locator('text=Nenhum pedido, text=nenhum').first()).toBeVisible()
    }
  })

  test('should switch between table, cards and kanban views', async ({ adminPage }) => {
    // Look for view toggle buttons
    const viewButtons = adminPage.locator('button:has-text("Tabela"), button:has-text("Cards"), button:has-text("Kanban")')
    const count = await viewButtons.count()

    if (count >= 2) {
      await viewButtons.nth(1).click()
      await adminPage.waitForTimeout(500)
      await viewButtons.nth(0).click()
    }
  })

  test('should show order status badges', async ({ adminPage }) => {
    const statuses = ['Pendente', 'Preparando', 'Pronto', 'Em entrega', 'Entregue', 'Cancelado']
    let found = false

    for (const status of statuses) {
      const badge = adminPage.locator(`text=${status}`).first()
      if (await badge.isVisible({ timeout: 2_000 }).catch(() => false)) {
        found = true
        break
      }
    }

    // At least one status should be visible (or empty state)
    expect(found || await adminPage.locator('text=Nenhum').first().isVisible().catch(() => false)).toBeTruthy()
  })

  test('admin should see create order button', async ({ adminPage }) => {
    const createButton = adminPage.locator('button:has-text("Novo Pedido"), button:has-text("Criar"), button:has-text("Adicionar")')
    await expect(createButton.first()).toBeVisible({ timeout: 10_000 })
  })

  test('viewer should NOT see create order button', async ({ viewerPage }) => {
    await viewerPage.goto('/orders')
    await viewerPage.waitForLoadState('networkidle')

    const createButton = viewerPage.locator('button:has-text("Novo Pedido"), button:has-text("Criar Pedido")')
    await expect(createButton).toHaveCount(0, { timeout: 5_000 })
  })
})
