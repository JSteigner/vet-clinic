import type { MockLink } from '@apollo/client/testing';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, test } from 'vitest';

import { formatInZone, fromWallTime, shiftDate, todayInZone } from '../../lib/time';
import LocationDisplay from '../../test/LocationDisplay';
import { renderWithProviders, TEST_TIME_ZONE } from '../../test/render';
import PetPage from './PetPage';
import { DELETE_PET, PET, PET_APPOINTMENTS, RESTORE_PET, UPDATE_PET } from './queries';

// Visit dates are relative to today, so the tests never go stale.
const today = todayInZone(TEST_TIME_ZONE);
const lastMonth = fromWallTime(`${shiftDate(today, -30)}T10:00`, TEST_TIME_ZONE);
const tomorrow = fromWallTime(`${shiftDate(today, 1)}T09:30`, TEST_TIME_ZONE);

const ARCHIVED_AT = '2026-11-14T18:00:00Z';

const petQuery = (archivedAt: string | null = null): MockLink.MockedResponse => ({
  request: { query: PET, variables: { id: '10', includeArchived: true } },
  result: {
    data: {
      pet: {
        __typename: 'Pet',
        id: '10',
        name: 'Rex',
        species: 'DOG',
        breed: 'Beagle',
        birthDate: '2020-05-01',
        archivedAt,
        owner: { __typename: 'Owner', id: '20', name: 'Ana Lima' },
      },
    },
  },
});

const restorePet = (result: MockLink.MockedResponse['result']): MockLink.MockedResponse => ({
  request: { query: RESTORE_PET, variables: { id: '10' } },
  result,
});

const visit = (id: string, startsAt: string, status: string, reason: string) => ({
  __typename: 'Appointment',
  id,
  startsAt,
  reason,
  status,
  vet: { __typename: 'Vet', id: '30', name: 'Dr. Kim' },
});

const pastVisit = visit('1', lastMonth, 'COMPLETED', 'Annual checkup');
const nextVisit = visit('2', tomorrow, 'SCHEDULED', 'Vaccines');

const visits = (status: string | null, appointments: object[]): MockLink.MockedResponse => ({
  request: {
    query: PET_APPOINTMENTS,
    variables: status
      ? { petId: '10', status, includeArchived: true }
      : { petId: '10', includeArchived: true },
  },
  result: { data: { petAppointments: appointments } },
});

const renderPage = (mocks: MockLink.MockedResponse[]) =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/pets/:id" element={<PetPage />} />
        <Route path="/owners/:id" element={<p>Owner page</p>} />
      </Routes>
      <LocationDisplay />
    </>,
    { mocks, route: '/pets/10' },
  );

describe('PetPage', () => {
  test('shows the pet and links to its owner', async () => {
    renderPage([petQuery(), visits(null, [])]);

    expect(await screen.findByRole('heading', { name: 'Rex' })).toBeInTheDocument();
    expect(screen.getByText('Dog')).toBeInTheDocument();
    expect(screen.getByText('Beagle')).toBeInTheDocument();
    expect(screen.getByText('May 1, 2020')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Ana Lima/ })[0]).toHaveAttribute(
      'href',
      '/owners/20',
    );
  });

  test('lists visits and filters them by status', async () => {
    const user = userEvent.setup();
    renderPage([
      petQuery(),
      visits(null, [pastVisit, nextVisit]),
      visits('COMPLETED', [pastVisit]),
    ]);

    const list = within(await screen.findByRole('list', { name: 'Visits' }));
    const past = formatInZone(lastMonth, TEST_TIME_ZONE, 'MMM d, yyyy h:mm a');
    expect(list.getByRole('link', { name: past })).toHaveAttribute('href', '/appointments/1');
    expect(list.getAllByRole('listitem')).toHaveLength(2);

    await user.selectOptions(screen.getByLabelText('Show'), 'Completed');

    expect(await screen.findByText('Dr. Kim · Annual checkup')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Kim · Vaccines')).not.toBeInTheDocument();
  });

  test('edits the pet', async () => {
    const user = userEvent.setup();
    renderPage([
      petQuery(),
      visits(null, []),
      {
        request: {
          query: UPDATE_PET,
          variables: {
            id: '10',
            input: { name: 'Rex', species: 'DOG', breed: 'Beagle mix', birthDate: '2020-06-01' },
          },
        },
        result: {
          data: {
            updatePet: {
              __typename: 'Pet',
              id: '10',
              name: 'Rex',
              species: 'DOG',
              breed: 'Beagle mix',
              birthDate: '2020-06-01',
            },
          },
        },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    const breed = screen.getByLabelText('Breed (optional)');
    await user.clear(breed);
    await user.type(breed, 'Beagle mix');
    // user.type can't fill a date input in jsdom; set the value directly.
    fireEvent.change(screen.getByLabelText('Birth date (optional)'), {
      target: { value: '2020-06-01' },
    });
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Beagle mix')).toBeInTheDocument();
    expect(screen.getByText('June 1, 2020')).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Edit pet' })).not.toBeInTheDocument();
  });

  test('cancels editing without saving', async () => {
    const user = userEvent.setup();
    renderPage([petQuery(), visits(null, [])]);

    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('form', { name: 'Edit pet' })).not.toBeInTheDocument();
    expect(screen.getByText('Beagle')).toBeInTheDocument();
  });

  test('shows a dash for a missing breed or birth date', async () => {
    renderPage([
      {
        request: { query: PET, variables: { id: '10', includeArchived: true } },
        result: {
          data: {
            pet: {
              __typename: 'Pet',
              id: '10',
              name: 'Rex',
              species: 'DOG',
              breed: null,
              birthDate: null,
              archivedAt: null,
              owner: { __typename: 'Owner', id: '20', name: 'Ana Lima' },
            },
          },
        },
      },
      visits(null, []),
    ]);

    expect(await screen.findByRole('heading', { name: 'Rex' })).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  test('shows an error when archiving fails', async () => {
    const user = userEvent.setup();
    renderPage([
      petQuery(),
      visits(null, []),
      {
        request: { query: DELETE_PET, variables: { id: '10' } },
        result: { errors: [{ message: 'Something broke' }] },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Archive pet' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't archive the pet: Something broke",
    );
  });

  test("archives the pet and returns to its owner's page", async () => {
    const user = userEvent.setup();
    renderPage([
      petQuery(),
      visits(null, []),
      {
        request: { query: DELETE_PET, variables: { id: '10' } },
        result: {
          data: { deletePet: { __typename: 'Pet', id: '10', archivedAt: '2026-11-14T00:00:00Z' } },
        },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Archive pet' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(await screen.findByText('Owner page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/owners/20');
  });

  test('shows an archived pet read-only, with its visits and a Restore button', async () => {
    renderPage([petQuery(ARCHIVED_AT), visits(null, [pastVisit])]);

    expect(await screen.findByText('Archived on November 14, 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Archive pet' })).not.toBeInTheDocument();
    expect(await screen.findByText('Dr. Kim · Annual checkup')).toBeInTheDocument();
  });

  test('restores the pet', async () => {
    const user = userEvent.setup();
    renderPage([
      petQuery(ARCHIVED_AT),
      visits(null, []),
      restorePet({ data: { restorePet: { __typename: 'Pet', id: '10', archivedAt: null } } }),
    ]);

    await user.click(await screen.findByRole('button', { name: 'Restore' }));

    expect(await screen.findByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.queryByText(/Archived on/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Archive pet' })).toBeInTheDocument();
  });

  test('shows why a restore was refused', async () => {
    const user = userEvent.setup();
    renderPage([
      petQuery(ARCHIVED_AT),
      visits(null, []),
      restorePet({ errors: [{ message: 'owner is archived; restore the owner first' }] }),
    ]);

    await user.click(await screen.findByRole('button', { name: 'Restore' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't restore the pet: owner is archived; restore the owner first",
    );
    expect(screen.getByText('Archived on November 14, 2026')).toBeInTheDocument();
  });

  test('shows not found for an unknown pet', async () => {
    renderPage([
      {
        request: { query: PET, variables: { id: '10', includeArchived: true } },
        result: { errors: [{ message: 'pet not found' }] },
      },
      visits(null, []),
    ]);

    expect(await screen.findByRole('heading', { name: 'Pet not found' })).toBeInTheDocument();
  });
});
