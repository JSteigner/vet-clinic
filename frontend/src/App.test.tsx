import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import App from './App';
import { OWNERS } from './features/owners/queries';
import { renderWithProviders, TEST_TIME_ZONE } from './test/render';

describe('App', () => {
  test('renders the navigation and the clinic time zone', async () => {
    // An unknown route renders only the layout, so no page queries need mocks.
    renderWithProviders(<App />, { route: '/nope' });

    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveTextContent('Schedule');
    expect(nav).toHaveTextContent('Owners');
    expect(nav).toHaveTextContent('Vets');
    expect(screen.getByRole('link', { name: 'Book appointment' })).toHaveAttribute(
      'href',
      '/appointments/new',
    );
    expect(await screen.findByText(`Times in ${TEST_TIME_ZONE}`)).toBeInTheDocument();
  });

  test('routes to a page', async () => {
    renderWithProviders(<App />, {
      route: '/owners',
      mocks: [{ request: { query: OWNERS }, result: { data: { owners: [] } } }],
    });

    expect(screen.getByRole('heading', { name: 'Owners' })).toBeInTheDocument();
    expect(await screen.findByText('No owners yet.')).toBeInTheDocument();
  });

  test('shows not found for unknown routes', () => {
    renderWithProviders(<App />, { route: '/nope' });

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
