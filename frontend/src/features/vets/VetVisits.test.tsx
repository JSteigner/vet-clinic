import type { MockLink } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { formatInZone, fromWallTime, shiftDate, todayInZone } from '../../lib/time';
import { renderWithProviders, TEST_TIME_ZONE } from '../../test/render';
import { VET_APPOINTMENTS } from './queries';
import VetVisits from './VetVisits';

// Visit dates are relative to today, so the tests never go stale.
const today = todayInZone(TEST_TIME_ZONE);
const lastMonth = fromWallTime(`${shiftDate(today, -30)}T10:00`, TEST_TIME_ZONE);
const nextWeek = fromWallTime(`${shiftDate(today, 7)}T09:30`, TEST_TIME_ZONE);

const visit = (id: string, startsAt: string, status: string, petName: string, reason: string) => ({
  __typename: 'Appointment',
  id,
  startsAt,
  reason,
  status,
  pet: {
    __typename: 'Pet',
    id: `p-${petName}`,
    name: petName,
    owner: { __typename: 'Owner', id: '20', name: 'Ana Lima' },
  },
});

const pastVisit = visit('1', lastMonth, 'COMPLETED', 'Mochi', 'Annual checkup');
const nextVisit = visit('2', nextWeek, 'SCHEDULED', 'Rex', 'Vaccines');

const visits = (
  status: string | null,
  result: MockLink.MockedResponse['result'],
): MockLink.MockedResponse => ({
  request: {
    query: VET_APPOINTMENTS,
    variables: status ? { vetId: '30', status } : { vetId: '30' },
  },
  result,
});

const found = (appointments: object[]) => ({ data: { vetAppointments: appointments } });

describe('VetVisits', () => {
  test("lists the vet's upcoming visits on any day by default, with the pet and owner", async () => {
    renderWithProviders(<VetVisits vetId="30" />, {
      mocks: [visits('SCHEDULED', found([nextVisit]))],
    });

    const list = within(await screen.findByRole('list', { name: 'Visits' }));
    const time = formatInZone(nextWeek, TEST_TIME_ZONE, 'MMM d, yyyy h:mm a');
    expect(list.getByRole('link', { name: time })).toHaveAttribute('href', '/appointments/2');
    expect(list.getByText('Rex (Ana Lima) · Vaccines')).toBeInTheDocument();
    expect(screen.getByLabelText('Show')).toHaveValue('SCHEDULED');
  });

  test('shows every visit, or another status, from the filter', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VetVisits vetId="30" />, {
      mocks: [
        visits('SCHEDULED', found([nextVisit])),
        visits(null, found([pastVisit, nextVisit])),
        visits('CANCELLED', found([])),
      ],
    });
    await screen.findByText('Rex (Ana Lima) · Vaccines');

    await user.selectOptions(screen.getByLabelText('Show'), 'All visits');
    expect(await screen.findByText('Mochi (Ana Lima) · Annual checkup')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    await user.selectOptions(screen.getByLabelText('Show'), 'Cancelled');
    expect(await screen.findByText('No visits.')).toBeInTheDocument();
  });

  test('shows an error when the visits fail to load', async () => {
    renderWithProviders(<VetVisits vetId="30" />, {
      mocks: [visits('SCHEDULED', { errors: [{ message: 'Something broke' }] })],
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't load the visits: Something broke",
    );
  });
});
