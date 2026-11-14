import type { AppointmentStatus } from '../gql/graphql';
import ConfirmButton from './ConfirmButton';

type Props = {
  status: AppointmentStatus;
  busy: boolean;
  onChange: (status: AppointmentStatus) => void;
};

/** The next steps for a visit: check in, complete, or cancel (confirmed). */
const StatusActions = ({ status, busy, onChange }: Props) => (
  <>
    {status === 'SCHEDULED' && (
      <button
        type="button"
        disabled={busy}
        onClick={() => onChange('CHECKED_IN')}
        className="rounded-md bg-teal-600 px-2.5 py-1 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        Check in
      </button>
    )}
    {status === 'CHECKED_IN' && (
      <button
        type="button"
        disabled={busy}
        onClick={() => onChange('COMPLETED')}
        className="rounded-md bg-emerald-600 px-2.5 py-1 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        Complete
      </button>
    )}
    {(status === 'SCHEDULED' || status === 'CHECKED_IN') && (
      <ConfirmButton
        label="Cancel"
        question="Cancel this visit?"
        disabled={busy}
        onConfirm={() => onChange('CANCELLED')}
      />
    )}
  </>
);

export default StatusActions;
