import type { MockLink } from '@apollo/client/testing';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { formatDate, fromWallTime, shiftDate, todayInZone } from '../../lib/time';
import { renderWithProviders, TEST_TIME_ZONE } from '../../test/render';
import { APPOINTMENT_CHANGED, DAILY_SCHEDULE, UPDATE_APPOINTMENT_STATUS } from './queries';
import SchedulePage from './SchedulePage';

// All dates are relative to today in the clinic zone, so the tests never go stale.
const today = todayInZone(TEST_TIME_ZONE);
const tomorrow = shiftDate(today, 1);

/** A UTC timestamp for a clock time on `date` in the clinic zone. */
const at = (date: string, time: string) => fromWallTime(`${date}T${time}`, TEST_TIME_ZONE);

const appointment = (overrides: Record<string, unknown> = {}) => ({
  __typename: 'Appointment',
  id: '1',
  startsAt: at(tomorrow, '09:30'),
  reason: 'Annual checkup',
  status: 'SCHEDULED',
  pet: {
    __typename: 'Pet',
    id: '10',
    name: 'Rex',
    species: 'DOG',
    owner: { __typename: 'Owner', id: '20', name: 'Ana Lima' },
  },
  vet: { __typename: 'Vet', id: '30', name: 'Dr. Kim' },
  ...overrides,
});

const schedule = (date: string, appointments: object[]): MockLink.MockedResponse => ({
  request: { query: DAILY_SCHEDULE, variables: { date } },
  result: { data: { appointments } },
});

const statusUpdate = (status: string): MockLink.MockedResponse => ({
  request: { query: UPDATE_APPOINTMENT_STATUS, variables: { id: '1', status } },
  result: { data: { updateAppointmentStatus: { __typename: 'Appointment', id: '1', status } } },
});

const appointmentChanged = (delay: number): MockLink.MockedResponse => ({
  request: { query: APPOINTMENT_CHANGED },
  result: {
    data: {
      appointmentChanged: {
        __typename: 'Appointment',
        id: '2',
        status: 'SCHEDULED',
        startsAt: at(tomorrow, '10:00'),
      },
    },
  },
  delay,
});

// The page always subscribes; this subscription never fires during a test.
const noUpdates = appointmentChanged(2 ** 31 - 1);

const renderPage = (mocks: MockLink.MockedResponse[], route = `/?date=${tomorrow}`) =>
  renderWithProviders(<SchedulePage />, { mocks: [noUpdates, ...mocks], route });

describe('SchedulePage', () => {
  test("shows the day's appointments with times in the clinic zone", async () => {
    renderPage([schedule(tomorrow, [appointment()])]);

    const row = within(await screen.findByRole('listitem'));
    expect(row.getByText('9:30 AM')).toBeInTheDocument();
    expect(row.getByText('Rex')).toBeInTheDocument();
    expect(row.getByText('(Dog)')).toBeInTheDocument();
    expect(row.getByText('Ana Lima · Annual checkup')).toBeInTheDocument();
    expect(row.getByText('Dr. Kim')).toBeInTheDocument();
    expect(row.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText(formatDate(tomorrow))).toBeInTheDocument();
  });

  test('defaults to today in the clinic zone', async () => {
    renderPage([schedule(today, [])], '/');

    expect(await screen.findByText('No appointments on this day.')).toBeInTheDocument();
    expect(screen.getByText(formatDate(today))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Today' })).toBeDisabled();
  });

  test('disables Today until the clinic zone has loaded', () => {
    renderPage([schedule(tomorrow, [])]);

    expect(screen.getByRole('button', { name: 'Today' })).toBeDisabled();
  });

  test('moves to the next day', async () => {
    const user = userEvent.setup();
    renderPage([schedule(tomorrow, [appointment()]), schedule(shiftDate(today, 2), [])]);

    await user.click(await screen.findByRole('button', { name: 'Next day' }));

    expect(await screen.findByText('No appointments on this day.')).toBeInTheDocument();
    expect(screen.getByText(formatDate(shiftDate(today, 2)))).toBeInTheDocument();
  });

  test('moves back a day, then returns to today', async () => {
    const lastWeek = shiftDate(today, -7);
    const user = userEvent.setup();
    renderPage(
      [schedule(lastWeek, []), schedule(shiftDate(lastWeek, -1), []), schedule(today, [])],
      `/?date=${lastWeek}`,
    );

    await user.click(await screen.findByRole('button', { name: 'Previous day' }));
    expect(await screen.findByText(formatDate(shiftDate(lastWeek, -1)))).toBeInTheDocument();
    // The day's contents need the clinic zone, which "Today" also needs.
    expect(await screen.findByText('No appointments on this day.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(await screen.findByText(formatDate(today))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Today' })).toBeDisabled();
  });

  test('jumps to a date picked in the date input', async () => {
    const nextMonth = shiftDate(today, 30);
    renderPage([schedule(tomorrow, []), schedule(nextMonth, [])]);

    // user.type can't fill a date input in jsdom; set the value directly.
    fireEvent.change(await screen.findByLabelText('Date'), { target: { value: nextMonth } });

    expect(await screen.findByText(formatDate(nextMonth))).toBeInTheDocument();
  });

  test('checks in a scheduled visit', async () => {
    const user = userEvent.setup();
    renderPage([schedule(tomorrow, [appointment()]), statusUpdate('CHECKED_IN')]);

    await user.click(await screen.findByRole('button', { name: 'Check in' }));

    expect(await screen.findByText('Checked in')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Complete' })).toBeInTheDocument();
  });

  test('completes a checked-in visit', async () => {
    const user = userEvent.setup();
    renderPage([
      schedule(tomorrow, [appointment({ status: 'CHECKED_IN' })]),
      statusUpdate('COMPLETED'),
    ]);

    await user.click(await screen.findByRole('button', { name: 'Complete' }));

    expect(await screen.findByText('Completed')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  test('asks before cancelling a visit', async () => {
    const user = userEvent.setup();
    renderPage([schedule(tomorrow, [appointment()]), statusUpdate('CANCELLED')]);

    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Cancel this visit?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(await screen.findByText('Cancelled')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Check in' })).not.toBeInTheDocument();
  });

  test('refreshes the day when an appointment changes', async () => {
    renderWithProviders(<SchedulePage />, {
      mocks: [
        // Fires after the first load: MockLink delays every response a little by
        // default, and an earlier event would merge into that first request.
        appointmentChanged(300),
        schedule(tomorrow, []),
        schedule(tomorrow, [appointment({ id: '2', startsAt: at(tomorrow, '10:00') })]),
      ],
      route: `/?date=${tomorrow}`,
    });

    expect(await screen.findByText('No appointments on this day.')).toBeInTheDocument();
    expect(await screen.findByText('10:00 AM')).toBeInTheDocument();
  });

  test('shows an error when the schedule fails to load', async () => {
    renderPage([
      {
        request: { query: DAILY_SCHEDULE, variables: { date: tomorrow } },
        error: new Error('Network down'),
      },
    ]);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't load the schedule: Network down",
    );
  });

  test('shows an error when a status change fails', async () => {
    const user = userEvent.setup();
    renderPage([
      schedule(tomorrow, [appointment()]),
      {
        request: { query: UPDATE_APPOINTMENT_STATUS, variables: { id: '1', status: 'CHECKED_IN' } },
        result: { errors: [{ message: 'appointment not found' }] },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Check in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't update the visit: appointment not found",
    );
  });
});
