import type { MockLink } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { formatInZone, fromWallTime, shiftDate, todayInZone } from '../../lib/time';
import { renderWithProviders, TEST_TIME_ZONE } from '../../test/render';
import OwnerVisits from './OwnerVisits';
import { OWNER_APPOINTMENTS } from './queries';

// Visit dates are relative to today, so the tests never go stale.
const today = todayInZone(TEST_TIME_ZONE);
const lastMonth = fromWallTime(`${shiftDate(today, -30)}T10:00`, TEST_TIME_ZONE);
const tomorrow = fromWallTime(`${shiftDate(today, 1)}T09:30`, TEST_TIME_ZONE);

const visit = (id: string, startsAt: string, status: string, petName: string, reason: string) => ({
  __typename: 'Appointment',
  id,
  startsAt,
  reason,
  status,
  pet: { __typename: 'Pet', id: `p-${petName}`, name: petName },
  vet: { __typename: 'Vet', id: '30', name: 'Dr. Kim' },
});

const pastVisit = visit('1', lastMonth, 'COMPLETED', 'Mochi', 'Annual checkup');
const nextVisit = visit('2', tomorrow, 'SCHEDULED', 'Rex', 'Vaccines');

const visits = (
  status: string | null,
  result: MockLink.MockedResponse['result'],
): MockLink.MockedResponse => ({
  request: {
    query: OWNER_APPOINTMENTS,
    variables: status
      ? { ownerId: '20', status, includeArchived: true }
      : { ownerId: '20', includeArchived: true },
  },
  result,
});

const found = (appointments: object[]) => ({ data: { ownerAppointments: appointments } });

describe('OwnerVisits', () => {
  test("lists the pets' upcoming visits by default, with the pet and vet", async () => {
    renderWithProviders(<OwnerVisits ownerId="20" />, {
      mocks: [visits('SCHEDULED', found([nextVisit]))],
    });

    const list = within(await screen.findByRole('list', { name: 'Visits' }));
    const time = formatInZone(tomorrow, TEST_TIME_ZONE, 'MMM d, yyyy h:mm a');
    expect(list.getByRole('link', { name: time })).toHaveAttribute('href', '/appointments/2');
    expect(list.getByText('Rex with Dr. Kim · Vaccines')).toBeInTheDocument();
    expect(screen.getByLabelText('Show')).toHaveValue('SCHEDULED');
  });

  test('shows every visit, or another status, from the filter', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OwnerVisits ownerId="20" />, {
      mocks: [
        visits('SCHEDULED', found([nextVisit])),
        visits(null, found([pastVisit, nextVisit])),
        visits('CANCELLED', found([])),
      ],
    });
    await screen.findByText('Rex with Dr. Kim · Vaccines');

    await user.selectOptions(screen.getByLabelText('Show'), 'All visits');
    expect(await screen.findByText('Mochi with Dr. Kim · Annual checkup')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    await user.selectOptions(screen.getByLabelText('Show'), 'Cancelled');
    expect(await screen.findByText('No visits.')).toBeInTheDocument();
  });

  test('shows an error when the visits fail to load', async () => {
    renderWithProviders(<OwnerVisits ownerId="20" />, {
      mocks: [visits('SCHEDULED', { errors: [{ message: 'Something broke' }] })],
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't load the visits: Something broke",
    );
  });
});
