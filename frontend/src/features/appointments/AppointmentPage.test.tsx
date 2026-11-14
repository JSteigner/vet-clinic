import type { MockLink } from '@apollo/client/testing';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, test } from 'vitest';

import { formatInZone, fromWallTime, shiftDate, todayInZone } from '../../lib/time';
import LocationDisplay from '../../test/LocationDisplay';
import { renderWithProviders, TEST_TIME_ZONE } from '../../test/render';
import { UPDATE_APPOINTMENT_STATUS } from '../schedule/queries';
import AppointmentPage from './AppointmentPage';
import { APPOINTMENT, DELETE_APPOINTMENT, UPDATE_APPOINTMENT } from './queries';

const tomorrow = shiftDate(todayInZone(TEST_TIME_ZONE), 1);
const startsAt = fromWallTime(`${tomorrow}T09:30`, TEST_TIME_ZONE);
const TIME_LABEL = `Date and time (${TEST_TIME_ZONE})`;

const kim = { __typename: 'Vet', id: '30', name: 'Dr. Kim' };
const alvarez = { __typename: 'Vet', id: '31', name: 'Dr. Alvarez' };

const appointmentQuery = (status = 'SCHEDULED'): MockLink.MockedResponse => ({
  request: { query: APPOINTMENT, variables: { id: '1' } },
  result: {
    data: {
      appointment: {
        __typename: 'Appointment',
        id: '1',
        startsAt,
        reason: 'Annual checkup',
        status,
        pet: {
          __typename: 'Pet',
          id: '10',
          name: 'Rex',
          species: 'DOG',
          owner: { __typename: 'Owner', id: '20', name: 'Ana Lima' },
        },
        vet: kim,
      },
      vets: [alvarez, kim],
    },
  },
});

const renderPage = (mocks: MockLink.MockedResponse[]) =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/appointments/:id" element={<AppointmentPage />} />
        <Route path="/" element={<p>Schedule</p>} />
      </Routes>
      <LocationDisplay />
    </>,
    { mocks, route: '/appointments/1' },
  );

describe('AppointmentPage', () => {
  test('shows the visit in the clinic zone', async () => {
    renderPage([appointmentQuery()]);

    expect(await screen.findByRole('heading', { name: 'Rex with Dr. Kim' })).toBeInTheDocument();
    expect(
      screen.getByText(formatInZone(startsAt, TEST_TIME_ZONE, "EEEE, MMMM d, yyyy 'at' h:mm a")),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Rex' })).toHaveAttribute('href', '/pets/10');
    expect(screen.getByText('(Dog)', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ana Lima' })).toHaveAttribute('href', '/owners/20');
    // The edit form's reason box holds the same text, so look in the details list.
    expect(screen.getByText('Annual checkup', { selector: 'dd' })).toBeInTheDocument();
  });

  test('reschedules and reassigns the vet', async () => {
    const newTime = `${shiftDate(tomorrow, 1)}T14:00`;
    const user = userEvent.setup();
    renderPage([
      appointmentQuery(),
      {
        request: {
          query: UPDATE_APPOINTMENT,
          variables: {
            id: '1',
            input: {
              startsAt: fromWallTime(newTime, TEST_TIME_ZONE),
              vetId: '31',
              reason: 'Annual checkup',
            },
          },
        },
        result: {
          data: {
            updateAppointment: {
              __typename: 'Appointment',
              id: '1',
              startsAt: fromWallTime(newTime, TEST_TIME_ZONE),
              reason: 'Annual checkup',
              vet: alvarez,
            },
          },
        },
      },
    ]);

    expect(await screen.findByLabelText(TIME_LABEL)).toHaveValue(`${tomorrow}T09:30`);
    // user.type can't fill a datetime-local input in jsdom; set the value directly.
    fireEvent.change(screen.getByLabelText(TIME_LABEL), { target: { value: newTime } });
    await user.selectOptions(screen.getByLabelText('Vet'), 'Dr. Alvarez');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Saved.');
    // The mutation result updated the cached appointment, so the heading changed too.
    expect(screen.getByRole('heading', { name: 'Rex with Dr. Alvarez' })).toBeInTheDocument();
  });

  test('shows field errors from a failed save', async () => {
    const user = userEvent.setup();
    renderPage([
      appointmentQuery(),
      {
        request: {
          query: UPDATE_APPOINTMENT,
          variables: { id: '1', input: { startsAt, vetId: '30', reason: 'Annual checkup' } },
        },
        result: {
          errors: [
            { message: 'startsAt must be in the future', extensions: { field: 'startsAt' } },
          ],
        },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('must be in the future')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('checks in the visit, after which it can no longer be edited', async () => {
    const user = userEvent.setup();
    renderPage([
      appointmentQuery(),
      {
        request: { query: UPDATE_APPOINTMENT_STATUS, variables: { id: '1', status: 'CHECKED_IN' } },
        result: {
          data: {
            updateAppointmentStatus: { __typename: 'Appointment', id: '1', status: 'CHECKED_IN' },
          },
        },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Check in' }));

    expect(await screen.findByText('Checked in')).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Edit appointment' })).not.toBeInTheDocument();
  });

  test('deletes after confirming and returns to that day', async () => {
    const user = userEvent.setup();
    renderPage([
      appointmentQuery(),
      {
        request: { query: DELETE_APPOINTMENT, variables: { id: '1' } },
        result: { data: { deleteAppointment: { __typename: 'Appointment', id: '1' } } },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Delete appointment' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    // Wait for the schedule stand-in, then check which day it opened.
    expect(await screen.findByText('Schedule')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(`/?date=${tomorrow}`);
  });

  test('shows not found for an unknown appointment', async () => {
    renderPage([
      {
        request: { query: APPOINTMENT, variables: { id: '1' } },
        result: { errors: [{ message: 'appointment not found' }] },
      },
    ]);

    expect(
      await screen.findByRole('heading', { name: 'Appointment not found' }),
    ).toBeInTheDocument();
  });

  test('shows other load errors as an alert', async () => {
    renderPage([
      { request: { query: APPOINTMENT, variables: { id: '1' } }, error: new Error('Network down') },
    ]);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't load the appointment: Network down",
    );
  });
});
