import { test as base } from '@playwright/test';

import { API_ORIGIN } from './helpers';

/**
 * Every test runs inside its own database transaction on the test database
 * (Phoenix.Ecto.SQL.Sandbox): `sandbox` starts one and rolls it back when the
 * test ends, so nothing a test creates is ever left behind. The browser and the
 * API helper send the sandbox id as their user agent, which routes their
 * requests into the transaction.
 */
export const test = base.extend<{ sandbox: string }>({
  sandbox: async ({ playwright }, provide) => {
    const api = await playwright.request.newContext();
    const response = await api.post(`${API_ORIGIN}/sandbox`);
    const sandbox = await response.text();

    await provide(sandbox);

    await api.delete(`${API_ORIGIN}/sandbox`, { headers: { 'user-agent': sandbox } });
    await api.dispose();
  },
  userAgent: async ({ sandbox }, provide) => {
    await provide(sandbox);
  },
  request: async ({ playwright, sandbox }, provide) => {
    const request = await playwright.request.newContext({
      extraHTTPHeaders: { 'user-agent': sandbox },
    });

    await provide(request);
    await request.dispose();
  },
});

export { expect } from '@playwright/test';
