import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link } from 'react-router';

import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { INPUT } from '../../components/styles';
import type { AppointmentStatus } from '../../gql/graphql';
import { formatInZone, useClinicTimeZone } from '../../lib/time';
import { PET_APPOINTMENTS } from './queries';

const FILTERS: { label: string; status: AppointmentStatus | '' }[] = [
  { label: 'All visits', status: '' },
  { label: 'Upcoming', status: 'SCHEDULED' },
  { label: 'Checked in', status: 'CHECKED_IN' },
  { label: 'Completed', status: 'COMPLETED' },
  { label: 'Cancelled', status: 'CANCELLED' },
];

/** A pet's visits, oldest first, optionally filtered by status. */
const PetHistory = ({ petId }: { petId: string }) => {
  const timeZone = useClinicTimeZone();
  const [status, setStatus] = useState<AppointmentStatus | ''>('');

  const { data, error } = useQuery(PET_APPOINTMENTS, {
    // Leave status out for all visits: the API filters on it whenever it's sent.
    variables: status ? { petId, status, includeArchived: true } : { petId, includeArchived: true },
    // The server filters this list, so refetch it rather than trust the cache.
    fetchPolicy: 'cache-and-network',
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Visits</h2>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Show
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as AppointmentStatus | '')}
            className={`${INPUT} w-auto`}
          >
            {FILTERS.map(({ label, status: value }) => (
              <option key={label} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <ErrorMessage error={error} prefix="Couldn't load the visits" />
      ) : !data || !timeZone ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : data.petAppointments.length === 0 ? (
        <p className="text-sm text-slate-500">No visits.</p>
      ) : (
        <ul
          aria-label="Visits"
          className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white"
        >
          {data.petAppointments.map(({ id, startsAt, reason, status: visitStatus, vet }) => (
            <li key={id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <Link
                  to={`/appointments/${id}`}
                  className="font-medium text-teal-700 hover:underline"
                >
                  {formatInZone(startsAt, timeZone, 'MMM d, yyyy h:mm a')}
                </Link>
                <p className="truncate text-sm text-slate-500">
                  {vet.name} · {reason}
                </p>
              </div>
              <StatusBadge status={visitStatus} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PetHistory;
