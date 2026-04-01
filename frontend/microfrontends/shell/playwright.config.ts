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

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run local dev server before tests (only when not in CI or production) */
  ...(baseURL.includes('localhost')
    ? {
        webServer: {
          command: 'npm run preview',
          port: 5000,
          reuseExistingServer: !isCI,
          timeout: 120_000,
        },
      }
    : {}),
})
