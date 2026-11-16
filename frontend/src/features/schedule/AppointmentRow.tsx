import { Link } from 'react-router';

import StatusActions from '../../components/StatusActions';
import StatusBadge from '../../components/StatusBadge';
import type { AppointmentRow_AppointmentFragment, AppointmentStatus } from '../../gql/graphql';
import { speciesLabel } from '../../lib/format';
import { formatInZone } from '../../lib/time';

type Props = {
  appointment: AppointmentRow_AppointmentFragment;
  timeZone: string;
  busy: boolean;
  onStatusChange: (status: AppointmentStatus) => void;
};

const AppointmentRow = ({ appointment, timeZone, busy, onStatusChange }: Props) => {
  const { id, startsAt, reason, status, pet, vet } = appointment;

  return (
    // Phones: status and actions wrap under the details. Wider: one row.
    <li className="grid grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-[5rem_1fr_10rem_16rem]">
      <Link
        to={`/appointments/${id}`}
        aria-label={`Open ${pet.name}'s appointment`}
        className="font-medium whitespace-nowrap text-teal-700 tabular-nums hover:underline"
      >
        <time dateTime={startsAt}>{formatInZone(startsAt, timeZone)}</time>
      </Link>
      <div className="min-w-0">
        <p className="truncate font-medium">
          <Link to={`/pets/${pet.id}`} className="hover:underline">
            {pet.name}
          </Link>{' '}
          <span className="font-normal text-slate-500">({speciesLabel(pet.species)})</span>
        </p>
        <p className="truncate text-sm text-slate-500">
          <Link to={`/owners/${pet.owner.id}`} className="hover:underline">
            {pet.owner.name}
          </Link>
          {` · ${reason}`}
        </p>
      </div>
      <p className="hidden truncate text-sm text-slate-600 sm:block">
        <Link to={`/vets/${vet.id}`} className="hover:underline">
          {vet.name}
        </Link>
      </p>
      <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-auto sm:justify-end">
        <StatusBadge status={status} />
        <StatusActions status={status} busy={busy} onChange={onStatusChange} />
      </div>
    </li>
  );
};

export default AppointmentRow;
