import type { MockLink } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, test } from 'vitest';

import LocationDisplay from '../../test/LocationDisplay';
import { renderWithProviders } from '../../test/render';
import OwnersPage from './OwnersPage';
import { CREATE_OWNER, OWNERS } from './queries';

const owner = (id: string, name: string, pets: { id: string; archivedAt: string | null }[]) => ({
  __typename: 'Owner',
  id,
  name,
  email: `${name.split(' ')[0].toLowerCase()}@example.com`,
  phone: null,
  pets: pets.map((pet) => ({ __typename: 'Pet', ...pet })),
});

const ownersQuery = (owners: object[]): MockLink.MockedResponse => ({
  request: { query: OWNERS },
  result: { data: { owners } },
});

const createOwner = (result: MockLink.MockedResponse['result']): MockLink.MockedResponse => ({
  request: {
    query: CREATE_OWNER,
    variables: { input: { name: 'Cy Diaz', email: 'cy@example.com', phone: null } },
  },
  result,
});

const renderPage = (mocks: MockLink.MockedResponse[]) =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/owners" element={<OwnersPage />} />
        <Route path="/owners/:id" element={<p>Owner page</p>} />
      </Routes>
      <LocationDisplay />
    </>,
    { mocks, route: '/owners' },
  );

const fillInNewOwner = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: 'Add owner' }));
  const form = within(screen.getByRole('form', { name: 'New owner' }));
  await user.type(form.getByLabelText('Name'), 'Cy Diaz');
  await user.type(form.getByLabelText('Email'), 'cy@example.com');
  await user.click(form.getByRole('button', { name: 'Add owner' }));
};

describe('OwnersPage', () => {
  test('lists owners by name with their active pets', async () => {
    renderPage([
      ownersQuery([
        owner('21', 'Ben Cho', []),
        owner('20', 'Ana Lima', [
          { id: '10', archivedAt: null },
          { id: '11', archivedAt: '2026-01-01T00:00:00Z' },
        ]),
      ]),
    ]);

    const rows = within(await screen.findByRole('list', { name: 'Owners' })).getAllByRole(
      'listitem',
    );
    expect(rows.map((row) => within(row).getByRole('link').textContent)).toEqual([
      'Ana Lima',
      'Ben Cho',
    ]);
    expect(rows[0]).toHaveTextContent('1 pet');
    expect(rows[1]).toHaveTextContent('0 pets');
    expect(within(rows[0]).getByRole('link')).toHaveAttribute('href', '/owners/20');
  });

  test('adds an owner and opens their page', async () => {
    const user = userEvent.setup();
    renderPage([
      ownersQuery([]),
      createOwner({ data: { createOwner: owner('22', 'Cy Diaz', []) } }),
    ]);

    await fillInNewOwner(user);

    expect(await screen.findByText('Owner page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/owners/22');
  });

  test("shows the API's field errors in the form", async () => {
    const user = userEvent.setup();
    renderPage([
      ownersQuery([]),
      createOwner({
        errors: [{ message: 'email has already been taken', extensions: { field: 'email' } }],
      }),
    ]);

    await fillInNewOwner(user);

    expect(await screen.findByText('has already been taken')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  test("shows an owner's phone when they have one", async () => {
    renderPage([ownersQuery([{ ...owner('20', 'Ana Lima', []), phone: '555-0100' }])]);

    expect(await screen.findByText('ana@example.com · 555-0100')).toBeInTheDocument();
  });

  test('shows errors that belong to no field above the form fields', async () => {
    const user = userEvent.setup();
    renderPage([ownersQuery([]), createOwner({ errors: [{ message: 'Something broke' }] })]);

    await fillInNewOwner(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't save the owner: Something broke",
    );
  });

  test('cancels adding an owner', async () => {
    const user = userEvent.setup();
    renderPage([ownersQuery([])]);

    await user.click(await screen.findByRole('button', { name: 'Add owner' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('form', { name: 'New owner' })).not.toBeInTheDocument();
  });

  test('shows an empty state and load errors', async () => {
    const { unmount } = renderPage([ownersQuery([])]);
    expect(await screen.findByText('No owners yet.')).toBeInTheDocument();
    unmount();

    renderPage([{ request: { query: OWNERS }, error: new Error('Network down') }]);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't load the owners: Network down",
    );
  });
});
