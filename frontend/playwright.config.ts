import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests against the real app: Vite on 5173 talking to Phoenix on
 * 4000, backed by the dev database. Both servers are started if they aren't
 * already running. Specs create their own uniquely named data through the API.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'mix phx.server',
      cwd: '../backend',
      // GraphiQL is served in dev only, so a 200 here means the dev API is up.
      url: 'http://localhost:4000/api/graphiql',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
