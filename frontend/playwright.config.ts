import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests against the real app, isolated from development: Phoenix
 * runs in the test env on 4002 against the test database, and its own Vite
 * server on 5174 talks to it. Each test runs in a sandboxed transaction that's
 * rolled back (see e2e/fixtures.ts), so no test data is ever left behind. The
 * dev servers on 4000/5173 and the dev database are never used.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'mix do ecto.create --quiet + ecto.migrate --quiet + phx.server',
      cwd: '../backend',
      // config/test.exs sets `server: false` for `mix test`; runtime.exs reads
      // PHX_SERVER to turn the endpoint on, and PORT (default 4000) for its port.
      env: { MIX_ENV: 'test', PHX_SERVER: 'true', PORT: '4002' },
      // GET without a query is a 400 from Absinthe, which Playwright counts as up.
      url: 'http://localhost:4002/api/graphql',
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- --port 5174',
      env: { VITE_API_URL: 'http://localhost:4002' },
      url: 'http://localhost:5174',
      reuseExistingServer: false,
    },
  ],
});
