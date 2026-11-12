import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import App from './App';
import { renderWithProviders, TEST_TIME_ZONE } from './test/render';

describe('App', () => {
  test('renders the navigation and the clinic time zone', async () => {
    // Not '/': the schedule page there makes its own queries.
    renderWithProviders(<App />, { route: '/owners' });

    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveTextContent('Schedule');
    expect(nav).toHaveTextContent('Owners');
    expect(nav).toHaveTextContent('Vets');
    expect(await screen.findByText(`Times in ${TEST_TIME_ZONE}`)).toBeInTheDocument();
  });

  test('routes to a page', () => {
    renderWithProviders(<App />, { route: '/owners' });

    expect(screen.getByRole('heading', { name: 'Owners' })).toBeInTheDocument();
  });

  test('shows not found for unknown routes', () => {
    renderWithProviders(<App />, { route: '/nope' });

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
