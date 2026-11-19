import { InMemoryCache } from '@apollo/client';
import type { MockLink } from '@apollo/client/testing';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, test } from 'vitest';

import { formatDate, fromWallTime, shiftDate, todayInZone } from '../../lib/time';
import LocationDisplay from '../../test/LocationDisplay';
import { renderWithProviders, TEST_TIME_ZONE } from '../../test/render';
import { DELETE_VET, UPDATE_VET, VET, VET_APPOINTMENTS, VETS } from './queries';
import VetPage from './VetPage';

// All dates are relative to today in the clinic zone, so the tests never go stale.
const today = todayInZone(TEST_TIME_ZONE);
const tomorrow = shiftDate(today, 1);

const vetQuery: MockLink.MockedResponse = {
  request: { query: VET, variables: { id: '30' } },
  result: {
    data: { vet: { __typename: 'Vet', id: '30', name: 'Dr. Kim', email: 'kim@example.com' } },
  },
};

const visit = {
  __typename: 'Appointment',
  id: '1',
  startsAt: fromWallTime(`${tomorrow}T09:30`, TEST_TIME_ZONE),
  reason: 'Vaccines',
  status: 'SCHEDULED',
  pet: {
    __typename: 'Pet',
    id: '10',
    name: 'Rex',
    owner: { __typename: 'Owner', id: '20', name: 'Ana Lima' },
  },
};

const schedule = (date: string, appointments: object[]): MockLink.MockedResponse => ({
  request: { query: VET_APPOINTMENTS, variables: { vetId: '30', date } },
  result: { data: { vetAppointments: appointments } },
});

// VetVisits has its own tests; here it just needs an answer.
const noUpcomingVisits: MockLink.MockedResponse = {
  request: { query: VET_APPOINTMENTS, variables: { vetId: '30', status: 'SCHEDULED' } },
  result: { data: { vetAppointments: [] } },
  maxUsageCount: Number.POSITIVE_INFINITY,
};

const renderPage = (
  mocks: MockLink.MockedResponse[],
  { route = '/vets/30', cache }: { route?: string; cache?: InMemoryCache } = {},
) =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/vets/:id" element={<VetPage />} />
        <Route path="/vets" element={<p>Vets</p>} />
      </Routes>
      <LocationDisplay />
    </>,
    { mocks: [noUpcomingVisits, ...mocks], route, cache },
  );

const deleted: MockLink.MockedResponse = {
  request: { query: DELETE_VET, variables: { id: '30' } },
  result: { data: { deleteVet: { __typename: 'Vet', id: '30' } } },
};

describe('VetPage', () => {
  test('goes back to today from another day', async () => {
    const user = userEvent.setup();
    renderPage([vetQuery, schedule(tomorrow, [visit]), schedule(today, [])], {
      route: `/vets/30?date=${tomorrow}`,
    });

    expect(await screen.findByText(formatDate(tomorrow))).toBeInTheDocument();
    // Today needs the clinic zone; the visit list only renders once it's loaded.
    expect(await screen.findByRole('list', { name: 'Schedule' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Today' }));

    expect(await screen.findByText(formatDate(today))).toBeInTheDocument();
    expect(await screen.findByText('No visits on this day.')).toBeInTheDocument();
  });

  test('cancels editing without saving', async () => {
    const user = userEvent.setup();
    renderPage([vetQuery, schedule(today, [])]);

    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('form', { name: 'Edit vet' })).not.toBeInTheDocument();
  });

  test('removes a deleted vet from the cached vets list', async () => {
    const user = userEvent.setup();
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: VETS,
      data: {
        vets: [
          { __typename: 'Vet', id: '30', name: 'Dr. Kim', email: 'kim@example.com' },
          { __typename: 'Vet', id: '31', name: 'Dr. Lee', email: 'lee@example.com' },
        ],
      },
    });
    renderPage([vetQuery, schedule(today, []), deleted], { cache });

    await user.click(await screen.findByRole('button', { name: 'Delete vet' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(await screen.findByText('Vets')).toBeInTheDocument();
    expect(cache.readQuery({ query: VETS })?.vets.map(({ name }) => name)).toEqual(['Dr. Lee']);
  });

  test("shows the vet and today's schedule by default", async () => {
    renderPage([vetQuery, schedule(today, [])]);

    expect(await screen.findByRole('heading', { name: 'Dr. Kim' })).toBeInTheDocument();
    expect(screen.getByText('kim@example.com')).toBeInTheDocument();
    expect(await screen.findByText('No visits on this day.')).toBeInTheDocument();
    expect(screen.getByText(formatDate(today))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Today' })).toBeDisabled();
  });

  test("shows another day's visits, linking to each visit and pet", async () => {
    renderPage([vetQuery, schedule(today, []), schedule(tomorrow, [visit])]);

    // user.type can't fill a date input in jsdom; set the value directly.
    fireEvent.change(await screen.findByLabelText('Day'), { target: { value: tomorrow } });

    const list = within(await screen.findByRole('list', { name: 'Schedule' }));
    expect(list.getByRole('link', { name: '9:30 AM' })).toHaveAttribute('href', '/appointments/1');
    expect(list.getByRole('link', { name: 'Rex' })).toHaveAttribute('href', '/pets/10');
    expect(list.getByText('Ana Lima · Vaccines')).toBeInTheDocument();
    expect(screen.getByText(formatDate(tomorrow))).toBeInTheDocument();
  });

  test('edits the vet', async () => {
    const user = userEvent.setup();
    renderPage([
      vetQuery,
      schedule(today, []),
      {
        request: {
          query: UPDATE_VET,
          variables: { id: '30', input: { name: 'Dr. Daniel Kim', email: 'kim@example.com' } },
        },
        result: {
          data: {
            updateVet: {
              __typename: 'Vet',
              id: '30',
              name: 'Dr. Daniel Kim',
              email: 'kim@example.com',
            },
          },
        },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    const name = screen.getByLabelText('Name');
    await user.clear(name);
    await user.type(name, 'Dr. Daniel Kim');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('heading', { name: 'Dr. Daniel Kim' })).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Edit vet' })).not.toBeInTheDocument();
  });

  test('deletes a vet with no appointments and returns to the list', async () => {
    const user = userEvent.setup();
    renderPage([vetQuery, schedule(today, []), deleted]);

    await user.click(await screen.findByRole('button', { name: 'Delete vet' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(await screen.findByText('Vets')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/vets');
  });

  test("shows the API's refusal to delete a vet who still has appointments", async () => {
    const user = userEvent.setup();
    renderPage([
      vetQuery,
      schedule(today, []),
      {
        request: { query: DELETE_VET, variables: { id: '30' } },
        result: {
          errors: [
            {
              message: 'appointments still exist for this vet',
              extensions: { field: 'appointments' },
            },
          ],
        },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Delete vet' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't delete the vet: appointments still exist for this vet",
    );
    expect(screen.getByTestId('location')).toHaveTextContent('/vets/30');
  });

  test('shows not found for an unknown vet', async () => {
    renderPage([
      {
        request: { query: VET, variables: { id: '30' } },
        result: { errors: [{ message: 'vet not found' }] },
      },
      schedule(today, []),
    ]);

    expect(await screen.findByRole('heading', { name: 'Vet not found' })).toBeInTheDocument();
  });
});
