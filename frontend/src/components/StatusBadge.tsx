import type { AppointmentStatus } from '../gql/graphql';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Scheduled',
  CHECKED_IN: 'Checked in',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-sky-50 text-sky-700 ring-sky-200',
  CHECKED_IN: 'bg-amber-50 text-amber-700 ring-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-500 ring-slate-200',
};

const StatusBadge = ({ status }: { status: AppointmentStatus }) => (
  <span
    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
  >
    {STATUS_LABELS[status]}
  </span>
);

export default StatusBadge;
