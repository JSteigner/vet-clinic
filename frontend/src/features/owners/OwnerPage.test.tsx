import type { MockLink } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, test } from 'vitest';

import LocationDisplay from '../../test/LocationDisplay';
import { renderWithProviders } from '../../test/render';
import { CREATE_PET } from '../pets/queries';
import OwnerPage from './OwnerPage';
import { DELETE_OWNER, OWNER, UPDATE_OWNER } from './queries';

const pet = (id: string, name: string, species: string, archivedAt: string | null = null) => ({
  __typename: 'Pet',
  id,
  name,
  species,
  breed: null,
  archivedAt,
});

const ownerQuery: MockLink.MockedResponse = {
  request: { query: OWNER, variables: { id: '20' } },
  result: {
    data: {
      owner: {
        __typename: 'Owner',
        id: '20',
        name: 'Ana Lima',
        email: 'ana@example.com',
        phone: '555-0100',
        pets: [
          pet('10', 'Rex', 'DOG'),
          pet('11', 'Old Tom', 'CAT', '2026-01-01T00:00:00Z'),
          pet('12', 'Bella', 'DOG'),
        ],
      },
    },
  },
};

const renderPage = (mocks: MockLink.MockedResponse[]) =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/owners/:id" element={<OwnerPage />} />
        <Route path="/owners" element={<p>Owners</p>} />
      </Routes>
      <LocationDisplay />
    </>,
    { mocks, route: '/owners/20' },
  );

describe('OwnerPage', () => {
  test('shows contact details and pets, archived ones without a link', async () => {
    renderPage([ownerQuery]);

    expect(await screen.findByRole('heading', { name: 'Ana Lima' })).toBeInTheDocument();
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(screen.getByText('555-0100')).toBeInTheDocument();

    const pets = within(screen.getByRole('list', { name: 'Pets' }));
    const links = pets.getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(['Bella', 'Rex']);
    expect(links[1]).toHaveAttribute('href', '/pets/10');
    expect(pets.getByText('Old Tom')).not.toHaveAttribute('href');
    expect(pets.getByText('Cat · Archived')).toBeInTheDocument();
  });

  test('edits the contact details', async () => {
    const user = userEvent.setup();
    renderPage([
      ownerQuery,
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
      ownerQuery,
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
    renderPage([
      ownerQuery,
      {
        request: { query: DELETE_OWNER, variables: { id: '20' } },
        result: {
          data: {
            deleteOwner: { __typename: 'Owner', id: '20', archivedAt: '2026-11-14T00:00:00Z' },
          },
        },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Archive owner' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(await screen.findByText('Owners')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/owners');
  });

  test('shows not found for an unknown or archived owner', async () => {
    renderPage([
      {
        request: { query: OWNER, variables: { id: '20' } },
        result: { errors: [{ message: 'owner not found' }] },
      },
    ]);

    expect(await screen.findByRole('heading', { name: 'Owner not found' })).toBeInTheDocument();
  });
});
