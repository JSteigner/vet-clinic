import type { MockLink } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, test } from 'vitest';

import LocationDisplay from '../../test/LocationDisplay';
import { renderWithProviders } from '../../test/render';
import { SEARCH } from './queries';
import SearchPage from './SearchPage';

type Variables = {
  term?: string | null;
  archived?: boolean;
  includeArchived?: boolean;
  types?: string[] | null;
};

const searchMock = (
  variables: Variables,
  result: MockLink.MockedResponse['result'],
): MockLink.MockedResponse => ({
  request: {
    query: SEARCH,
    variables: {
      term: null,
      archived: false,
      includeArchived: false,
      types: null,
      limit: 50,
      ...variables,
    },
  },
  result,
});

const found = ({ owners = [], pets = [], vets = [] }: Record<string, object[]>) => ({
  data: { search: { __typename: 'SearchResults', owners, pets, vets } },
});

const owner = (id: string, name: string, archivedAt: string | null = null) => ({
  __typename: 'Owner',
  id,
  name,
  email: `${id}@example.com`,
  phone: null,
  archivedAt,
});

const rexPet = {
  __typename: 'Pet',
  id: '10',
  name: 'Rex',
  species: 'DOG',
  archivedAt: null,
  owner: { __typename: 'Owner', id: '20', name: 'Rexford Hale' },
};

const renderPage = (route: string, mocks: MockLink.MockedResponse[]) =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<p>Record page</p>} />
      </Routes>
      <LocationDisplay />
    </>,
    { mocks, route },
  );

const location = () => screen.getByTestId('location');
const includeArchived = () => screen.getByRole('checkbox', { name: 'Include archived' });

describe('SearchPage', () => {
  test('lists the results by group, with counts and links', async () => {
    renderPage('/search?q=rex', [
      searchMock({ term: 'rex' }, found({ owners: [owner('20', 'Rexford Hale')], pets: [rexPet] })),
    ]);

    const pets = within(await screen.findByRole('list', { name: 'Pets' }));
    expect(screen.getByRole('heading', { name: 'Pets (1)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Owners (1)' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Vets/ })).not.toBeInTheDocument();
    expect(pets.getByRole('link')).toHaveAttribute('href', '/pets/10');
    expect(screen.getByLabelText('Search owners, pets and vets')).toHaveValue('rex');
    expect(includeArchived()).not.toBeChecked();
  });

  test('asks for a search when there is nothing to search', () => {
    renderPage('/search', []);

    expect(screen.getByText(/Type at least 2 characters/)).toBeInTheDocument();
  });

  test('searches the submitted text, keeping "Include archived"', async () => {
    const user = userEvent.setup();
    renderPage('/search?q=rex&archived=1', [
      searchMock({ term: 'rex', includeArchived: true }, found({})),
      searchMock(
        { term: 'hale', includeArchived: true },
        found({ owners: [owner('20', 'Rexford Hale')] }),
      ),
    ]);
    expect(await screen.findByText('No matches.')).toBeInTheDocument();

    const box = screen.getByLabelText('Search owners, pets and vets');
    await user.clear(box);
    await user.type(box, ' hale {Enter}');

    expect(location()).toHaveTextContent('/search?q=hale&archived=1');
    expect(await screen.findByRole('heading', { name: 'Owners (1)' })).toBeInTheDocument();
  });

  test('adds archived records to the active ones when the box is checked', async () => {
    const user = userEvent.setup();
    renderPage('/search?q=rex', [
      searchMock({ term: 'rex' }, found({ owners: [owner('21', 'Rexanne Bell')] })),
      searchMock(
        { term: 'rex', includeArchived: true },
        found({
          owners: [
            owner('21', 'Rexanne Bell'),
            owner('20', 'Rexford Hale', '2026-11-14T18:00:00Z'),
          ],
        }),
      ),
    ]);
    expect(await screen.findByRole('heading', { name: 'Owners (1)' })).toBeInTheDocument();

    await user.click(includeArchived());

    expect(location()).toHaveTextContent('/search?q=rex&archived=1');
    expect(await screen.findByRole('heading', { name: 'Owners (2)' })).toBeInTheDocument();
    const rows = within(screen.getByRole('list', { name: 'Owners' })).getAllByRole('link');
    expect(rows.map((row) => row.textContent)).toEqual([
      'Rexanne Bell21@example.com',
      'Rexford HaleArchived20@example.com',
    ]);

    await user.click(includeArchived());
    expect(location()).toHaveTextContent('/search?q=rex');
    expect(location()).not.toHaveTextContent('archived');
  });

  test('lists archived records for the "archived" keyword, with the box checked and locked', async () => {
    renderPage('/search?q=archived%20owners', [
      searchMock(
        { archived: true, types: ['OWNER'] },
        found({ owners: [owner('20', 'Rexford Hale', '2026-11-14T18:00:00Z')] }),
      ),
    ]);

    expect(await screen.findByRole('heading', { name: 'Owners (1)' })).toBeInTheDocument();
    expect(includeArchived()).toBeChecked();
    expect(includeArchived()).toBeDisabled();
  });

  test('still asks for a search with only the box checked', () => {
    renderPage('/search?archived=1', []);

    expect(screen.getByText(/Type at least 2 characters/)).toBeInTheDocument();
    expect(includeArchived()).toBeChecked();
  });

  test('says vets are not archived', async () => {
    renderPage('/search?q=archived%20vets', [
      searchMock({ archived: true, types: ['VET'] }, found({})),
    ]);

    expect(await screen.findByText("Vets aren't archived.")).toBeInTheDocument();
  });

  test('notes when a group reaches the limit', async () => {
    const owners = Array.from({ length: 50 }, (_, i) => owner(`${i + 1}`, `Owner ${i + 1}`));
    renderPage('/search?q=owners', [searchMock({ types: ['OWNER'] }, found({ owners }))]);

    expect(await screen.findByRole('heading', { name: 'Owners (50)' })).toBeInTheDocument();
    expect(screen.getByText(/Showing the first 50/)).toBeInTheDocument();
  });

  test('shows an error when the search fails', async () => {
    renderPage('/search?q=rex', [
      searchMock({ term: 'rex' }, { errors: [{ message: 'Something broke' }] }),
    ]);

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't search: Something broke");
  });
});
