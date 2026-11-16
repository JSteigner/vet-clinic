import { InMemoryCache } from '@apollo/client';
import type { MockLink } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, test } from 'vitest';

import LocationDisplay from '../../test/LocationDisplay';
import { renderWithProviders } from '../../test/render';
import { CREATE_PET } from '../pets/queries';
import OwnerPage from './OwnerPage';
import { DELETE_OWNER, OWNER, OWNERS, RESTORE_OWNER, UPDATE_OWNER } from './queries';

const ARCHIVED_AT = '2026-11-14T18:00:00Z';
const OLD_TOM_ARCHIVED_AT = '2026-01-01T18:00:00Z';

const pet = (id: string, name: string, species: string, archivedAt: string | null = null) => ({
  __typename: 'Pet',
  id,
  name,
  species,
  breed: null,
  archivedAt,
});

// An archived owner's pets were archived with them, except Old Tom, archived before.
const ownerQuery = (archivedAt: string | null = null): MockLink.MockedResponse => ({
  request: { query: OWNER, variables: { id: '20', includeArchived: true } },
  result: {
    data: {
      owner: {
        __typename: 'Owner',
        id: '20',
        name: 'Ana Lima',
        email: 'ana@example.com',
        phone: '555-0100',
        archivedAt,
        pets: [
          pet('10', 'Rex', 'DOG', archivedAt),
          pet('11', 'Old Tom', 'CAT', OLD_TOM_ARCHIVED_AT),
          pet('12', 'Bella', 'DOG', archivedAt),
        ],
      },
    },
  },
});

const renderPage = (mocks: MockLink.MockedResponse[], cache?: InMemoryCache) =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/owners/:id" element={<OwnerPage />} />
        <Route path="/owners" element={<p>Owners</p>} />
      </Routes>
      <LocationDisplay />
    </>,
    { mocks, route: '/owners/20', cache },
  );

const archiveOwner = (result: MockLink.MockedResponse['result']): MockLink.MockedResponse => ({
  request: { query: DELETE_OWNER, variables: { id: '20' } },
  result,
});

const archived = {
  data: { deleteOwner: { __typename: 'Owner', id: '20', archivedAt: ARCHIVED_AT } },
};

const restoreOwner = (result: MockLink.MockedResponse['result']): MockLink.MockedResponse => ({
  request: { query: RESTORE_OWNER, variables: { id: '20' } },
  result,
});

const restored = {
  data: {
    restoreOwner: {
      __typename: 'Owner',
      id: '20',
      name: 'Ana Lima',
      email: 'ana@example.com',
      phone: '555-0100',
      archivedAt: null,
      pets: [
        { __typename: 'Pet', id: '10', archivedAt: null },
        { __typename: 'Pet', id: '11', archivedAt: OLD_TOM_ARCHIVED_AT },
        { __typename: 'Pet', id: '12', archivedAt: null },
      ],
    },
  },
};

const listed = (id: string, name: string) => ({
  __typename: 'Owner' as const,
  id,
  name,
  email: `${id}@example.com`,
  phone: null,
  pets: [],
});

describe('OwnerPage', () => {
  test('shows an owner with no phone or pets', async () => {
    renderPage([
      {
        request: { query: OWNER, variables: { id: '20', includeArchived: true } },
        result: {
          data: {
            owner: {
              __typename: 'Owner',
              id: '20',
              name: 'Ana Lima',
              email: 'ana@example.com',
              phone: null,
              archivedAt: null,
              pets: [],
            },
          },
        },
      },
    ]);

    expect(await screen.findByText('No pets yet.')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('cancels editing and adding a pet without saving', async () => {
    const user = userEvent.setup();
    renderPage([ownerQuery()]);

    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('form', { name: 'Edit owner' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add pet' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('form', { name: 'New pet' })).not.toBeInTheDocument();
  });

  test('removes an archived owner from the cached owners list', async () => {
    const user = userEvent.setup();
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: OWNERS,
      data: { owners: [listed('20', 'Ana Lima'), listed('21', 'Ben Cho')] },
    });
    renderPage([ownerQuery(), archiveOwner(archived)], cache);

    await user.click(await screen.findByRole('button', { name: 'Archive owner' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(await screen.findByText('Owners')).toBeInTheDocument();
    expect(cache.readQuery({ query: OWNERS })?.owners.map(({ name }) => name)).toEqual(['Ben Cho']);
  });

  test('shows an error when archiving fails', async () => {
    const user = userEvent.setup();
    renderPage([ownerQuery(), archiveOwner({ errors: [{ message: 'Something broke' }] })]);

    await user.click(await screen.findByRole('button', { name: 'Archive owner' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't archive the owner: Something broke",
    );
  });

  test('shows contact details and pets, archived ones last', async () => {
    renderPage([ownerQuery()]);

    expect(await screen.findByRole('heading', { name: 'Ana Lima' })).toBeInTheDocument();
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(screen.getByText('555-0100')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Restore' })).not.toBeInTheDocument();

    const pets = within(screen.getByRole('list', { name: 'Pets' }));
    const links = pets.getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(['Bella', 'Rex', 'Old Tom']);
    expect(links[1]).toHaveAttribute('href', '/pets/10');
    expect(links[2]).toHaveAttribute('href', '/pets/11');
    expect(pets.getByText('Cat · Archived')).toBeInTheDocument();
  });

  test('edits the contact details', async () => {
    const user = userEvent.setup();
    renderPage([
      ownerQuery(),
      {
        request: {
          query: UPDATE_OWNER,
          variables: {
            id: '20',
            input: { name: 'Ana Lima', email: 'ana@example.com', phone: '555-0199' },
          },
        },
        result: {
          data: {
            updateOwner: {
              __typename: 'Owner',
              id: '20',
              name: 'Ana Lima',
              email: 'ana@example.com',
              phone: '555-0199',
            },
          },
        },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    const phone = screen.getByLabelText('Phone (optional)');
    await user.clear(phone);
    await user.type(phone, '555-0199');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('555-0199')).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Edit owner' })).not.toBeInTheDocument();
  });

  test('adds a pet, which joins the list from the cache', async () => {
    const user = userEvent.setup();
    renderPage([
      ownerQuery(),
      {
        request: {
          query: CREATE_PET,
          variables: {
            input: { name: 'Kiwi', species: 'BIRD', breed: null, birthDate: null, ownerId: '20' },
          },
        },
        result: { data: { createPet: pet('13', 'Kiwi', 'BIRD') } },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Add pet' }));
    const form = within(screen.getByRole('form', { name: 'New pet' }));
    await user.type(form.getByLabelText('Name'), 'Kiwi');
    await user.selectOptions(form.getByLabelText('Species'), 'Bird');
    await user.click(form.getByRole('button', { name: 'Add pet' }));

    // No second OWNER mock: the new pet comes from the cache update, not a refetch.
    expect(await screen.findByRole('link', { name: 'Kiwi' })).toHaveAttribute('href', '/pets/13');
    expect(screen.queryByRole('form', { name: 'New pet' })).not.toBeInTheDocument();
  });

  test('archives the owner after confirming', async () => {
    const user = userEvent.setup();
    renderPage([ownerQuery(), archiveOwner(archived)]);

    await user.click(await screen.findByRole('button', { name: 'Archive owner' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(await screen.findByText('Owners')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/owners');
  });

  test('shows an archived owner read-only, with a Restore button', async () => {
    renderPage([ownerQuery(ARCHIVED_AT)]);

    expect(await screen.findByText('Archived on November 14, 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add pet' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Archive owner' })).not.toBeInTheDocument();
  });

  test('restores the owner and the pets archived with them', async () => {
    const user = userEvent.setup();
    const cache = new InMemoryCache();
    cache.writeQuery({ query: OWNERS, data: { owners: [listed('21', 'Ben Cho')] } });
    renderPage([ownerQuery(ARCHIVED_AT), restoreOwner(restored)], cache);

    await user.click(await screen.findByRole('button', { name: 'Restore' }));

    expect(await screen.findByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.queryByText(/Archived on/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Archive owner' })).toBeInTheDocument();
    expect(screen.getAllByText(/Archived$/).map((text) => text.textContent)).toEqual([
      'Cat · Archived',
    ]);
    expect(cache.readQuery({ query: OWNERS })?.owners.map(({ name }) => name)).toEqual([
      'Ben Cho',
      'Ana Lima',
    ]);
  });

  test('shows an error when restoring fails', async () => {
    const user = userEvent.setup();
    renderPage([
      ownerQuery(ARCHIVED_AT),
      restoreOwner({ errors: [{ message: 'Something broke' }] }),
    ]);

    await user.click(await screen.findByRole('button', { name: 'Restore' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't restore the owner: Something broke",
    );
  });

  test('shows not found for an unknown owner', async () => {
    renderPage([
      {
        request: { query: OWNER, variables: { id: '20', includeArchived: true } },
        result: { errors: [{ message: 'owner not found' }] },
      },
    ]);

    expect(await screen.findByRole('heading', { name: 'Owner not found' })).toBeInTheDocument();
  });
});
