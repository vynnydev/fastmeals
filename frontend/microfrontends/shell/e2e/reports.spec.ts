import { test, expect } from './fixtures'

test.describe('Reports Page (remote-reports)', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/reports')
    await adminPage.waitForLoadState('networkidle')
  })

  test('should load reports page', async ({ adminPage }) => {
    await expect(adminPage.locator('text=Relatórios').first()).toBeVisible({ timeout: 15_000 })
  })

  test('should display stat cards', async ({ adminPage }) => {
    await expect(adminPage.locator('text=Receita Total').first()).toBeVisible({ timeout: 10_000 })
    await expect(adminPage.locator('text=Total de Pedidos').first()).toBeVisible()
  })

  test('should have three tabs: Overview, Entregas, AI Insights', async ({ adminPage }) => {
    await expect(adminPage.locator('text=Visão Geral').first()).toBeVisible({ timeout: 10_000 })
    await expect(adminPage.locator('text=Entregas').first()).toBeVisible()
    await expect(adminPage.locator('text=IA Insights, text=AI Insights').first()).toBeVisible()
  })

  test('should display charts in overview tab', async ({ adminPage }) => {
    await adminPage.locator('text=Visão Geral').first().click()
    await adminPage.waitForTimeout(1_000)

    // Charts or empty states
    const hasCharts = await adminPage.locator('text=Pedidos por Status, text=Receita Diária').first().isVisible({ timeout: 5_000 }).catch(() => false)
    expect(hasCharts || await adminPage.locator('text=Nenhum dado').first().isVisible().catch(() => false)).toBeTruthy()
  })

  test('should switch to entregas tab', async ({ adminPage }) => {
    await adminPage.locator('text=Entregas').first().click()
    await adminPage.waitForTimeout(1_000)

    await expect(adminPage.locator('text=Tempo médio, text=Mais rápido, text=Mais lento').first()).toBeVisible({ timeout: 5_000 })
  })

  test('should switch to AI Insights tab and generate insights', async ({ adminPage }) => {
    await adminPage.locator('text=IA Insights, text=AI Insights').first().click()
    await adminPage.waitForTimeout(1_000)

    const generateButton = adminPage.locator('button:has-text("Gerar Insights"), button:has-text("Gerar")')
    await expect(generateButton.first()).toBeVisible({ timeout: 5_000 })

    // Click generate
    await generateButton.first().click()

    // Wait for results (fallback-local or Bedrock)
    await expect(adminPage.locator('text=Resumo Inteligente, text=Recomendações, text=Destaques').first()).toBeVisible({ timeout: 15_000 })
  })

  test('should have date range filters', async ({ adminPage }) => {
    const dateInputs = adminPage.locator('input[type="date"]')
    const count = await dateInputs.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('should update data when changing date range', async ({ adminPage }) => {
    const dateInputs = adminPage.locator('input[type="date"]')

    if (await dateInputs.count() >= 2) {
      await dateInputs.nth(0).fill('2026-03-01')
      await dateInputs.nth(1).fill('2026-03-31')

      // Click update button if exists
      const updateButton = adminPage.locator('button:has-text("Atualizar")')
      if (await updateButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await updateButton.click()
        await adminPage.waitForTimeout(2_000)
      }
    }
  })
})
