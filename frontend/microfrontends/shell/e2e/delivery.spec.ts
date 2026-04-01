import { test, expect } from './fixtures'

test.describe('Delivery Page (remote-delivery)', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/delivery')
    await adminPage.waitForLoadState('networkidle')
  })

  test('should load delivery page', async ({ adminPage }) => {
    await expect(adminPage.locator('text=Entregadores').first()).toBeVisible({ timeout: 15_000 })
  })

  test('should display delivery persons', async ({ adminPage }) => {
    const hasDrivers = await adminPage.locator('[data-testid="driver-card"], text=Disponível, text=Em Entrega, text=Inativo').first().isVisible({ timeout: 10_000 }).catch(() => false)
    expect(hasDrivers || await adminPage.locator('text=Nenhum entregador, text=nenhum').first().isVisible().catch(() => false)).toBeTruthy()
  })

  test('should have tabs for drivers and optimization', async ({ adminPage }) => {
    const driversTab = adminPage.locator('text=Entregadores, button:has-text("Entregadores")').first()
    const optimizationTab = adminPage.locator('text=Otimização, button:has-text("Otimização")').first()

    await expect(driversTab).toBeVisible({ timeout: 10_000 })

    if (await optimizationTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await optimizationTab.click()
      await adminPage.waitForTimeout(1_000)
      await expect(adminPage.locator('text=Hungarian, text=Otimizar, text=otimização').first()).toBeVisible({ timeout: 5_000 })
    }
  })

  test('should display driver status categories', async ({ adminPage }) => {
    const statuses = ['Disponível', 'Disponíveis', 'Em Entrega', 'Inativo', 'Inativos']
    let found = false

    for (const status of statuses) {
      if (await adminPage.locator(`text=${status}`).first().isVisible({ timeout: 2_000 }).catch(() => false)) {
        found = true
        break
      }
    }

    expect(found || await adminPage.locator('text=Nenhum').first().isVisible().catch(() => false)).toBeTruthy()
  })

  test('admin should see create driver button', async ({ adminPage }) => {
    const createButton = adminPage.locator('button:has-text("Novo Entregador"), button:has-text("Criar"), button:has-text("Adicionar")')
    await expect(createButton.first()).toBeVisible({ timeout: 10_000 })
  })

  test('viewer should NOT see create driver button', async ({ viewerPage }) => {
    await viewerPage.goto('/delivery')
    await viewerPage.waitForLoadState('networkidle')

    const createButton = viewerPage.locator('button:has-text("Novo Entregador"), button:has-text("Criar Entregador")')
    await expect(createButton).toHaveCount(0, { timeout: 5_000 })
  })
})
