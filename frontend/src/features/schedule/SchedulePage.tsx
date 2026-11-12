import { useMutation, useQuery, useSubscription } from '@apollo/client/react';
import { useSearchParams } from 'react-router';

import ErrorMessage from '../../components/ErrorMessage';
import type { AppointmentStatus } from '../../gql/graphql';
import { formatDate, shiftDate, todayInZone, useClinicTimeZone } from '../../lib/time';
import AppointmentRow from './AppointmentRow';
import { APPOINTMENT_CHANGED, DAILY_SCHEDULE, UPDATE_APPOINTMENT_STATUS } from './queries';

const NAV_BUTTON =
  'rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50';

/** The clinic's appointments for one day (`?date=`, default today), kept live. */
const SchedulePage = () => {
  const timeZone = useClinicTimeZone();
  const [searchParams, setSearchParams] = useSearchParams();
  const today = timeZone && todayInZone(timeZone);
  const date = searchParams.get('date') ?? today;

  const { data, error, refetch } = useQuery(DAILY_SCHEDULE, {
    variables: { date },
    skip: !date,
  });

  // Any booking, reschedule or status change may affect the day shown.
  useSubscription(APPOINTMENT_CHANGED, {
    onData: () => {
      if (date) void refetch();
    },
  });

  const [updateStatus, { loading: updating, error: updateError }] =
    useMutation(UPDATE_APPOINTMENT_STATUS);

  const changeStatus = (id: string, status: AppointmentStatus) => {
    // A failure is shown from updateError, so the rejected promise needs no handling.
    updateStatus({ variables: { id, status } }).catch(() => {});
  };

  const goTo = (next: string) => setSearchParams({ date: next });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Schedule</h1>
          {date && <p className="text-slate-500">{formatDate(date)}</p>}
        </div>
        {date && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous day"
              onClick={() => goTo(shiftDate(date, -1))}
              className={NAV_BUTTON}
            >
              ‹
            </button>
            <button
              type="button"
              // Disabled until the clinic zone loads: "today" depends on it.
              disabled={!today || date === today}
              onClick={() => today && goTo(today)}
              className={NAV_BUTTON}
            >
              Today
            </button>
            <button
              type="button"
              aria-label="Next day"
              onClick={() => goTo(shiftDate(date, 1))}
              className={NAV_BUTTON}
            >
              ›
            </button>
            <label htmlFor="schedule-date" className="sr-only">
              Date
            </label>
            <input
              id="schedule-date"
              type="date"
              value={date}
              onChange={(event) => event.target.value && goTo(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
            />
          </div>
        )}
      </div>

      {updateError && <ErrorMessage error={updateError} prefix="Couldn't update the visit" />}

      {error ? (
        <ErrorMessage error={error} prefix="Couldn't load the schedule" />
      ) : !data || !timeZone ? (
        <p className="text-slate-500">Loading…</p>
      ) : data.appointments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-slate-500">
          No appointments on this day.
        </p>
      ) : (
        <ul
          aria-label="Appointments"
          className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white"
        >
          {data.appointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              timeZone={timeZone}
              busy={updating}
              onStatusChange={(status) => changeStatus(appointment.id, status)}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default SchedulePage;
