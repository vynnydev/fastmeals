import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: isCI ? 'github' : 'html',
  timeout: 30_000,
  globalSetup: './e2e/global-setup.ts',

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 10_000,
  },

  projects: [
    // Auth tests run without stored state (they test login itself)
    {
      name: 'auth',
      testMatch: 'auth.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // All other tests run with admin auth state pre-loaded
    {
      name: 'admin',
      testMatch: ['dashboard.spec.ts', 'orders.spec.ts', 'products.spec.ts', 'delivery.spec.ts', 'reports.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    // Smoke tests run without stored state (they login manually)
    {
      name: 'smoke',
      testMatch: 'smoke.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // Full flow test for demo/recording (single browser, no reopen)
    {
      name: 'full-flow',
      testMatch: 'full-flow.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})