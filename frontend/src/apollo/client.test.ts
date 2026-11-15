import { afterEach, expect, test, vi } from 'vitest';

import { CLINIC_TIME_ZONE } from '../lib/time';

afterEach(() => {
  vi.unstubAllGlobals();
});

test("sends queries over HTTP to the API's /api/graphql endpoint", async () => {
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ data: { clinicTimeZone: 'America/Chicago' } }), {
        headers: { 'content-type': 'application/json' },
      }),
  );
  vi.stubGlobal('fetch', fetchMock);
  // Imported after stubbing, so the client's HTTP link uses the stub.
  const { client } = await import('./client');

  const { data } = await client.query({ query: CLINIC_TIME_ZONE });

  expect(data?.clinicTimeZone).toBe('America/Chicago');
  expect(fetchMock).toHaveBeenCalledWith(
    'http://localhost:4000/api/graphql',
    expect.objectContaining({ method: 'POST' }),
  );
});
