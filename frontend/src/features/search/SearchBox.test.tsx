import type { MockLink } from '@apollo/client/testing';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import LocationDisplay from '../../test/LocationDisplay';
import { renderWithProviders } from '../../test/render';
import { SEARCH } from './queries';
import SearchBox from './SearchBox';

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
      limit: 5,
      ...variables,
    },
  },
  result,
});

const found = ({ owners = [], pets = [], vets = [] }: Record<string, object[]>) => ({
  data: { search: { __typename: 'SearchResults', owners, pets, vets } },
});

const rexResults = found({
  owners: [
    {
      __typename: 'Owner',
      id: '20',
      name: 'Rexford Hale',
      email: 'rexford@example.com',
      phone: '555-0199',
      archivedAt: null,
    },
  ],
  pets: [
    {
      __typename: 'Pet',
      id: '10',
      name: 'Rex',
      species: 'DOG',
      archivedAt: '2026-11-14T18:00:00Z',
      owner: { __typename: 'Owner', id: '20', name: 'Rexford Hale' },
    },
  ],
  vets: [{ __typename: 'Vet', id: '30', name: 'Dr. Rexa', email: 'rexa@example.com' }],
});

const renderBox = (mocks: MockLink.MockedResponse[]) =>
  renderWithProviders(
    <>
      <SearchBox />
      <LocationDisplay />
    </>,
    { mocks },
  );

const box = () => screen.getByRole('combobox', { name: 'Search owners, pets and vets' });
const location = () => screen.getByTestId('location');

describe('SearchBox', () => {
  // Fake timers let the tests skip the debounce; shouldAdvanceTime keeps mocks resolving.
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const search = async (text: string) => {
    await user.type(box(), text);
    act(() => vi.advanceTimersByTime(500));
  };

  test('searches once typing pauses, and lists results by group', async () => {
    renderBox([searchMock({ term: 'rex' }, rexResults)]);

    await user.type(box(), 'rex');
    expect(screen.getByText('Searching…')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(500));

    const pets = within(await screen.findByRole('group', { name: 'Pets' }));
    expect(pets.getByRole('option')).toHaveTextContent('RexArchivedDog · Rexford Hale');
    expect(
      within(screen.getByRole('group', { name: 'Owners' })).getByRole('option'),
    ).toHaveTextContent('Rexford Halerexford@example.com · 555-0199');
    expect(
      within(screen.getByRole('group', { name: 'Vets' })).getByRole('option'),
    ).toHaveTextContent('Dr. Rexa');
    expect(box()).toHaveAttribute('aria-expanded', 'true');
  });

  test('stays closed under 2 characters', async () => {
    renderBox([]);

    await search('r');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(box()).toHaveAttribute('aria-expanded', 'false');
  });

  test('opens the highlighted result with Enter, and clears the box', async () => {
    renderBox([searchMock({ term: 'rex' }, rexResults)]);
    await search('rex');
    await screen.findByRole('group', { name: 'Pets' });

    await user.keyboard('{ArrowDown}{ArrowDown}');
    const rex = screen.getByRole('option', { name: /Dog · Rexford Hale/ });
    expect(rex).toHaveAttribute('aria-selected', 'true');
    expect(box()).toHaveAttribute('aria-activedescendant', rex.id);

    await user.keyboard('{Enter}');

    expect(location()).toHaveTextContent('/pets/10');
    expect(box()).toHaveValue('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('goes to the results page with Enter when nothing is highlighted', async () => {
    renderBox([searchMock({ term: 'rex' }, rexResults)]);
    await search('rex');

    await user.keyboard('{Enter}');

    expect(location()).toHaveTextContent('/search?q=rex');
  });

  test('wraps from the first option up to "See all results"', async () => {
    renderBox([searchMock({ term: 'rex hale' }, found({}))]);
    await search('rex hale');
    await screen.findByText('No matches.');

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('option', { name: 'See all results for “rex hale”' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.keyboard('{ArrowDown}{Enter}');

    expect(location()).toHaveTextContent('/search?q=rex%20hale');
  });

  test('goes to the results page from "See all results"', async () => {
    renderBox([searchMock({ term: 'rex' }, rexResults)]);
    await search('rex');

    await user.click(await screen.findByRole('option', { name: 'See all results for “rex”' }));

    expect(location()).toHaveTextContent('/search?q=rex');
  });

  test('adds archived records with "Include archived", keeping the list open', async () => {
    renderBox([
      searchMock({ term: 'rex' }, found({})),
      searchMock({ term: 'rex', includeArchived: true }, rexResults),
    ]);
    await search('rex');
    await screen.findByText('No matches.');

    await user.click(screen.getByRole('checkbox', { name: 'Include archived' }));

    expect(box()).toHaveFocus();
    expect(await screen.findByRole('group', { name: 'Pets' })).toBeInTheDocument();

    await user.keyboard('{Enter}');
    expect(location()).toHaveTextContent('/search?q=rex&archived=1');
  });

  test('opens a clicked result', async () => {
    renderBox([searchMock({ term: 'rex' }, rexResults)]);
    await search('rex');

    await user.click(await screen.findByRole('option', { name: /^Dr\. Rexa/ }));

    expect(location()).toHaveTextContent('/vets/30');
  });

  test('closes on Escape and when focus leaves, and reopens on focus', async () => {
    renderBox([searchMock({ term: 'rex' }, rexResults)]);
    await search('rex');
    await screen.findByRole('group', { name: 'Pets' });

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.tab();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.click(box());
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('ignores arrow keys and Enter with nothing to search', async () => {
    renderBox([]);

    await user.click(box());
    await user.keyboard('{ArrowDown}{Enter}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(location()).toHaveTextContent('/');
  });

  test('says vets are not archived', async () => {
    renderBox([searchMock({ archived: true, types: ['VET'] }, found({}))]);

    await search('archived vets');

    expect(await screen.findByText("Vets aren't archived.")).toBeInTheDocument();
  });

  test('shows an error when the search fails', async () => {
    renderBox([searchMock({ term: 'rex' }, { errors: [{ message: 'Something broke' }] })]);

    await search('rex');

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't search: Something broke");
  });
});
