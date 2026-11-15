import type { InMemoryCache } from '@apollo/client';
import type { MockLink } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

import { CLINIC_TIME_ZONE } from '../lib/time';

/** The clinic zone used across tests. */
export const TEST_TIME_ZONE = 'America/Chicago';

export const clinicTimeZoneMock: MockLink.MockedResponse = {
  request: { query: CLINIC_TIME_ZONE },
  result: { data: { clinicTimeZone: TEST_TIME_ZONE } },
  maxUsageCount: Number.POSITIVE_INFINITY,
};

type Options = {
  mocks?: MockLink.MockedResponse[];
  route?: string;
  /** A cache to render with, e.g. seeded with writeQuery to test cache updates. */
  cache?: InMemoryCache;
};

/**
 * Renders `ui` inside a router at `route` and an Apollo MockedProvider with
 * `mocks` (plus the clinic time zone), the way pages run in the app.
 */
export const renderWithProviders = (
  ui: ReactElement,
  { mocks = [], route = '/', cache }: Options = {},
) =>
  render(
    <MockedProvider mocks={[clinicTimeZoneMock, ...mocks]} cache={cache}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </MockedProvider>,
  );
