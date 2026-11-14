import { useQuery } from '@apollo/client/react';
import { Link, useSearchParams } from 'react-router';

import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { SECONDARY_BUTTON } from '../../components/styles';
import { formatDate, formatInZone, todayInZone, useClinicTimeZone } from '../../lib/time';
import { VET_APPOINTMENTS } from './queries';

/** A vet's visits on one day (`?date=`, default today in the clinic zone). */
const VetSchedule = ({ vetId }: { vetId: string }) => {
  const timeZone = useClinicTimeZone();
  const [searchParams, setSearchParams] = useSearchParams();
  const today = timeZone && todayInZone(timeZone);
  const date = searchParams.get('date') ?? today;

  const { data, error } = useQuery(VET_APPOINTMENTS, {
    variables: { vetId, date },
    skip: !date,
    // The server picks the day's visits, so refetch rather than trust the cache.
    fetchPolicy: 'cache-and-network',
  });

  const goTo = (next: string) => setSearchParams({ date: next });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Schedule</h2>
          {date && <p className="text-sm text-slate-500">{formatDate(date)}</p>}
        </div>
        {date && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!today || date === today}
              onClick={() => today && goTo(today)}
              className={SECONDARY_BUTTON}
            >
              Today
            </button>
            <label htmlFor="vet-schedule-date" className="sr-only">
              Day
            </label>
            <input
              id="vet-schedule-date"
              type="date"
              value={date}
              onChange={(event) => event.target.value && goTo(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
            />
          </div>
        )}
      </div>

      {error ? (
        <ErrorMessage error={error} prefix="Couldn't load the schedule" />
      ) : !data || !timeZone ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : data.vetAppointments.length === 0 ? (
        <p className="text-sm text-slate-500">No visits on this day.</p>
      ) : (
        <ul
          aria-label="Visits"
          className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white"
        >
          {data.vetAppointments.map(({ id, startsAt, reason, status, pet }) => (
            <li key={id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <Link
                  to={`/appointments/${id}`}
                  className="font-medium text-teal-700 tabular-nums hover:underline"
                >
                  {formatInZone(startsAt, timeZone)}
                </Link>{' '}
                <Link to={`/pets/${pet.id}`} className="font-medium hover:underline">
                  {pet.name}
                </Link>
                <p className="truncate text-sm text-slate-500">
                  {pet.owner.name} · {reason}
                </p>
              </div>
              <StatusBadge status={status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VetSchedule;
