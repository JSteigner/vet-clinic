import { Link } from 'react-router';

import type { AppointmentStatus } from '../gql/graphql';
import { formatInZone, useClinicTimeZone } from '../lib/time';
import ErrorMessage from './ErrorMessage';
import StatusBadge from './StatusBadge';
import { INPUT } from './styles';

/** A status to filter by, or '' for every visit. */
export type VisitFilter = AppointmentStatus | '';

const FILTERS: { label: string; status: VisitFilter }[] = [
  { label: 'All visits', status: '' },
  { label: 'Upcoming', status: 'SCHEDULED' },
  { label: 'Checked in', status: 'CHECKED_IN' },
  { label: 'Completed', status: 'COMPLETED' },
  { label: 'Cancelled', status: 'CANCELLED' },
];

export type Visit = {
  id: string;
  startsAt: string;
  status: AppointmentStatus;
  /** The line under the time, e.g. "Rex with Dr. Kim · Vaccines". */
  detail: string;
};

type Props = {
  /** The visits to show, oldest first, or undefined while they load. */
  visits: Visit[] | undefined;
  error?: unknown;
  filter: VisitFilter;
  onFilterChange: (filter: VisitFilter) => void;
};

/** A list of visits with a status filter, each linking to its appointment. */
const VisitList = ({ visits, error, filter, onFilterChange }: Props) => {
  const timeZone = useClinicTimeZone();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Visits</h2>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Show
          <select
            value={filter}
            onChange={(event) => onFilterChange(event.target.value as VisitFilter)}
            className={`${INPUT} w-auto`}
          >
            {FILTERS.map(({ label, status }) => (
              <option key={label} value={status}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <ErrorMessage error={error} prefix="Couldn't load the visits" />
      ) : !visits || !timeZone ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : visits.length === 0 ? (
        <p className="text-sm text-slate-500">No visits.</p>
      ) : (
        <ul
          aria-label="Visits"
          className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white"
        >
          {visits.map(({ id, startsAt, status, detail }) => (
            <li key={id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <Link
                  to={`/appointments/${id}`}
                  className="font-medium text-teal-700 hover:underline"
                >
                  {formatInZone(startsAt, timeZone, 'MMM d, yyyy h:mm a')}
                </Link>
                <p className="truncate text-sm text-slate-500">{detail}</p>
              </div>
              <StatusBadge status={status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VisitList;
