import type { MockLink } from '@apollo/client/testing';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { fromWallTime, shiftDate, todayInZone } from '../../lib/time';
import LocationDisplay from '../../test/LocationDisplay';
import { renderWithProviders, TEST_TIME_ZONE } from '../../test/render';
import BookingPage from './BookingPage';
import { BOOKING_OPTIONS, CREATE_APPOINTMENT, OWNER_PETS, PET_OWNER } from './queries';

const tomorrow = shiftDate(todayInZone(TEST_TIME_ZONE), 1);

const options: MockLink.MockedResponse = {
  request: { query: BOOKING_OPTIONS },
  result: {
    data: {
      owners: [
        { __typename: 'Owner', id: '20', name: 'Ana Lima' },
        { __typename: 'Owner', id: '21', name: 'Ben Cho' },
      ],
      vets: [{ __typename: 'Vet', id: '30', name: 'Dr. Kim' }],
    },
  },
};

const anaPets: MockLink.MockedResponse = {
  request: { query: OWNER_PETS, variables: { ownerId: '20' } },
  result: {
    data: { ownerPets: [{ __typename: 'Pet', id: '10', name: 'Rex', species: 'DOG' }] },
  },
};

const booking = (startsAt: string): MockLink.MockedResponse['request'] => ({
  query: CREATE_APPOINTMENT,
  variables: {
    input: {
      petId: '10',
      vetId: '30',
      startsAt: fromWallTime(startsAt, TEST_TIME_ZONE),
      reason: 'Vaccines',
    },
  },
});

const renderPage = (
  mocks: MockLink.MockedResponse[],
  route = `/appointments/new?date=${tomorrow}`,
) =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/appointments/new" element={<BookingPage />} />
        <Route path="/" element={<p>Schedule</p>} />
      </Routes>
      <LocationDisplay />
    </>,
    { mocks: [options, anaPets, ...mocks], route },
  );

/** Picks an owner once the owners have loaded. */
const chooseOwner = async (user: ReturnType<typeof userEvent.setup>) => {
  await screen.findByRole('option', { name: 'Ana Lima' });
  await user.selectOptions(screen.getByLabelText('Owner'), 'Ana Lima');
};

const fillIn = async (user: ReturnType<typeof userEvent.setup>) => {
  await chooseOwner(user);
  await screen.findByRole('option', { name: 'Rex' });
  await user.selectOptions(screen.getByLabelText('Pet'), 'Rex');
  await user.selectOptions(screen.getByLabelText('Vet'), 'Dr. Kim');
  await user.type(screen.getByLabelText('Reason'), 'Vaccines');
};

describe('BookingPage', () => {
  test("starts at 9:00 on another day's schedule, in the clinic zone", async () => {
    renderPage([]);

    const time = await screen.findByLabelText(`Date and time (${TEST_TIME_ZONE})`);
    expect(time).toHaveValue(`${tomorrow}T09:00`);
  });

  describe('at 2:07 PM clinic time', () => {
    // Only Date is faked, so Apollo's and user-event's timers run as usual.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-11-12T20:07:30Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('starts at the next quarter hour, and goes back to the schedule, without a day', async () => {
      renderPage([], '/appointments/new');

      const time = await screen.findByLabelText(`Date and time (${TEST_TIME_ZONE})`);
      expect(time).toHaveValue('2026-11-12T14:15');
      expect(screen.getByRole('link', { name: 'Back to schedule' })).toHaveAttribute('href', '/');
    });

    test("starts at the next quarter hour from today's schedule", async () => {
      renderPage([], '/appointments/new?date=2026-11-12');

      const time = await screen.findByLabelText(`Date and time (${TEST_TIME_ZONE})`);
      expect(time).toHaveValue('2026-11-12T14:15');
    });

    test('keeps a time once it has been changed', async () => {
      renderPage([], '/appointments/new');

      const time = await screen.findByLabelText(`Date and time (${TEST_TIME_ZONE})`);
      fireEvent.change(time, { target: { value: '2026-11-13T10:30' } });
      vi.setSystemTime(new Date('2026-11-12T20:20:00Z'));
      await userEvent.setup().type(screen.getByLabelText('Reason'), 'x');

      expect(time).toHaveValue('2026-11-13T10:30');
    });
  });

  describe('filled in from the URL', () => {
    const fields = () => ({
      owner: screen.getByLabelText('Owner'),
      pet: screen.getByLabelText('Pet'),
      vet: screen.getByLabelText('Vet'),
    });

    test('picks the owner and vet given', async () => {
      renderPage([], '/appointments/new?ownerId=20&vetId=30');

      await screen.findByRole('option', { name: 'Rex' });
      expect(fields().owner).toHaveValue('20');
      expect(fields().pet).toHaveValue('');
      expect(fields().vet).toHaveValue('30');
    });

    test('picks the pet given, and its owner', async () => {
      renderPage(
        [
          {
            request: { query: PET_OWNER, variables: { petId: '10' } },
            result: { data: { petOwner: { __typename: 'Owner', id: '20' } } },
          },
        ],
        '/appointments/new?petId=10',
      );

      await screen.findByRole('option', { name: 'Rex' });
      expect(fields().owner).toHaveValue('20');
      expect(fields().pet).toHaveValue('10');
    });

    test("ignores an owner or vet the form doesn't offer, e.g. an archived one", async () => {
      renderPage([], '/appointments/new?ownerId=99&vetId=98');

      await screen.findByRole('option', { name: 'Ana Lima' });
      expect(fields().owner).toHaveValue('');
      expect(fields().vet).toHaveValue('');
    });

    test('lets the choices be changed, clearing the pet with a new owner', async () => {
      const user = userEvent.setup();
      renderPage(
        [
          {
            request: { query: OWNER_PETS, variables: { ownerId: '21' } },
            result: { data: { ownerPets: [] } },
          },
        ],
        '/appointments/new?ownerId=20&vetId=30',
      );
      await screen.findByRole('option', { name: 'Rex' });
      await user.selectOptions(fields().pet, 'Rex');

      await user.selectOptions(fields().owner, 'Ben Cho');

      expect(fields().owner).toHaveValue('21');
      expect(fields().pet).toHaveValue('');
      expect(fields().vet).toHaveValue('30');
    });
  });

  test('offers pets only after an owner is chosen', async () => {
    const user = userEvent.setup();
    renderPage([]);

    expect(await screen.findByLabelText('Pet')).toBeDisabled();
    await chooseOwner(user);

    expect(await screen.findByRole('option', { name: 'Rex' })).toBeInTheDocument();
    expect(screen.getByLabelText('Pet')).toBeEnabled();
  });

  test('books the visit in UTC and returns to that day on the schedule', async () => {
    const user = userEvent.setup();
    renderPage([
      {
        request: booking(`${tomorrow}T09:00`),
        result: {
          data: {
            createAppointment: {
              __typename: 'Appointment',
              id: '1',
              startsAt: fromWallTime(`${tomorrow}T09:00`, TEST_TIME_ZONE),
            },
          },
        },
      },
    ]);

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: 'Book appointment' }));

    // Wait for the schedule stand-in, then check which day it opened.
    expect(await screen.findByText('Schedule')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(`/?date=${tomorrow}`);
  });

  test("shows the API's field errors under their inputs", async () => {
    const yesterday = shiftDate(todayInZone(TEST_TIME_ZONE), -1);
    const user = userEvent.setup();
    renderPage([
      {
        request: booking(`${yesterday}T09:00`),
        result: {
          errors: [
            { message: 'startsAt must be in the future', extensions: { field: 'startsAt' } },
          ],
        },
      },
    ]);

    await fillIn(user);
    const time = screen.getByLabelText(`Date and time (${TEST_TIME_ZONE})`);
    // user.type can't fill a datetime-local input in jsdom; set the value directly.
    fireEvent.change(time, { target: { value: `${yesterday}T09:00` } });
    await user.click(screen.getByRole('button', { name: 'Book appointment' }));

    expect(await screen.findByText('must be in the future')).toBeInTheDocument();
    expect(time).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('location')).toHaveTextContent('/appointments/new');
  });

  test('shows errors that belong to no field above the form', async () => {
    const user = userEvent.setup();
    renderPage([
      {
        request: booking(`${tomorrow}T09:00`),
        result: { errors: [{ message: 'pet not found' }] },
      },
    ]);

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: 'Book appointment' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't book the visit: pet not found",
    );
  });
});
