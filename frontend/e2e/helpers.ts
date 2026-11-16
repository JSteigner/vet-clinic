import { TZDate, tz } from '@date-fns/tz';
import { type APIRequestContext, expect, type Page } from '@playwright/test';
import { addDays, format } from 'date-fns';

// Setup goes straight to the API with plain GraphQL strings: the UI is what
// these specs test, and src/gql's typed documents are for the app itself.

/** The e2e Phoenix server: MIX_ENV=test, on the test database. */
export const API_ORIGIN = 'http://localhost:4002';

type Named = { id: string; name: string };

/** Runs a GraphQL document against the e2e API, failing the test on any error. */
export const graphql = async <T>(
  request: APIRequestContext,
  query: string,
  variables: { [key: string]: unknown } = {},
): Promise<T> => {
  const response = await request.post(`${API_ORIGIN}/api/graphql`, { data: { query, variables } });
  const body = (await response.json()) as { data: T; errors?: unknown };

  expect(body.errors, `GraphQL errors: ${JSON.stringify(body.errors)}`).toBeUndefined();
  return body.data;
};

/**
 * A suffix for names and emails. Tests run in parallel in separate transactions,
 * and two of them inserting the same email would block on its unique index.
 */
export const unique = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const clinicTimeZone = async (request: APIRequestContext) =>
  (await graphql<{ clinicTimeZone: string }>(request, '{ clinicTimeZone }')).clinicTimeZone;

/** The YYYY-MM-DD date `days` from today in the clinic's zone. */
export const clinicDate = (zone: string, days: number) =>
  format(addDays(new TZDate(Date.now(), zone), days), 'yyyy-MM-dd', { in: tz(zone) });

/** A UTC ISO timestamp for a clock time on `date` in the clinic's zone. */
export const clinicTime = (zone: string, date: string, time: string) => {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  return new Date(new TZDate(year, month - 1, day, hour, minute, zone).getTime()).toISOString();
};

/** Creates an owner with one pet. Each test starts from an empty database. */
export const createOwnerWithPet = async (request: APIRequestContext) => {
  const id = unique();
  const { createOwner: owner } = await graphql<{ createOwner: Named }>(
    request,
    'mutation ($input: CreateOwnerInput!) { createOwner(input: $input) { id name } }',
    { input: { name: `E2E Owner ${id}`, email: `e2e-${id}@example.com` } },
  );
  const { createPet: pet } = await graphql<{ createPet: Named }>(
    request,
    'mutation ($input: CreatePetInput!) { createPet(input: $input) { id name } }',
    { input: { ownerId: owner.id, name: `Pet ${id}`, species: 'DOG' } },
  );

  return { owner, pet };
};

/** Creates a vet to book with. */
export const createVet = async (request: APIRequestContext) => {
  const id = unique();
  const { createVet: vet } = await graphql<{ createVet: Named }>(
    request,
    'mutation ($input: CreateVetInput!) { createVet(input: $input) { id name } }',
    { input: { name: `Dr. E2E ${id}`, email: `vet-${id}@example.com` } },
  );

  return vet;
};

/** Books an appointment directly, returning its id. */
export const createAppointment = async (
  request: APIRequestContext,
  input: { petId: string; vetId: string; startsAt: string; reason: string },
) =>
  (
    await graphql<{ createAppointment: { id: string } }>(
      request,
      'mutation ($input: CreateAppointmentInput!) { createAppointment(input: $input) { id } }',
      { input },
    )
  ).createAppointment.id;

/**
 * Resolves once every subscription the page has sent (Absinthe "doc" pushes over
 * the Phoenix socket) has been acknowledged with a subscription ID. React's
 * StrictMode subscribes twice in dev, so waiting for the first reply isn't enough.
 * Call before the page navigates, so the socket is observed from the start.
 */
export const trackSubscriptions = (page: Page) => {
  let sent = 0;
  let acknowledged = 0;

  page.on('websocket', (socket) => {
    socket.on('framesent', ({ payload }) => {
      if (String(payload).includes('"doc"')) sent += 1;
    });
    socket.on('framereceived', ({ payload }) => {
      if (String(payload).includes('subscriptionId')) acknowledged += 1;
    });
  });

  return () => expect.poll(() => sent > 0 && acknowledged >= sent).toBe(true);
};
