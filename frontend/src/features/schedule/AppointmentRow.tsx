import ConfirmButton from '../../components/ConfirmButton';
import StatusBadge from '../../components/StatusBadge';
import type { AppointmentStatus, DailyScheduleQuery } from '../../gql/graphql';
import { formatInZone } from '../../lib/time';

type Props = {
  appointment: DailyScheduleQuery['appointments'][number];
  timeZone: string;
  busy: boolean;
  onStatusChange: (status: AppointmentStatus) => void;
};

const capitalize = (word: string) => word.charAt(0) + word.slice(1).toLowerCase();

const AppointmentRow = ({ appointment, timeZone, busy, onStatusChange }: Props) => {
  const { startsAt, reason, status, pet, vet } = appointment;
  const open = status === 'SCHEDULED' || status === 'CHECKED_IN';

  return (
    // Phones: status and actions wrap under the details. Wider: one row.
    <li className="grid grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-[5rem_1fr_10rem_auto]">
      <time dateTime={startsAt} className="font-medium whitespace-nowrap tabular-nums">
        {formatInZone(startsAt, timeZone)}
      </time>
      <div className="min-w-0">
        <p className="truncate font-medium">
          {pet.name} <span className="font-normal text-slate-500">({capitalize(pet.species)})</span>
        </p>
        <p className="truncate text-sm text-slate-500">
          {pet.owner.name} · {reason}
        </p>
      </div>
      <p className="hidden truncate text-sm text-slate-600 sm:block">{vet.name}</p>
      <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-auto sm:justify-end">
        <StatusBadge status={status} />
        {status === 'SCHEDULED' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatusChange('CHECKED_IN')}
            className="rounded-md bg-teal-600 px-2.5 py-1 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            Check in
          </button>
        )}
        {status === 'CHECKED_IN' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatusChange('COMPLETED')}
            className="rounded-md bg-emerald-600 px-2.5 py-1 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Complete
          </button>
        )}
        {open && (
          <ConfirmButton
            label="Cancel"
            question="Cancel this visit?"
            disabled={busy}
            onConfirm={() => onStatusChange('CANCELLED')}
          />
        )}
      </div>
    </li>
  );
};

export default AppointmentRow;
