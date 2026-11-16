import { formatInZone, useClinicTimeZone } from '../lib/time';
import ErrorMessage from './ErrorMessage';
import { SECONDARY_BUTTON } from './styles';

type Props = {
  /** When the record was archived, a UTC ISO timestamp. */
  archivedAt: string;
  /** What was archived, for the error message, e.g. "owner". */
  what: string;
  busy: boolean;
  error?: unknown;
  onRestore: () => void;
};

/** Marks a page's record as archived (read-only), with a button to restore it. */
const ArchivedBanner = ({ archivedAt, what, busy, error, onRestore }: Props) => {
  const timeZone = useClinicTimeZone();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <p>
          Archived
          {timeZone && ` on ${formatInZone(archivedAt, timeZone, 'MMMM d, yyyy')}`}
        </p>
        <button type="button" onClick={onRestore} disabled={busy} className={SECONDARY_BUTTON}>
          Restore
        </button>
      </div>
      {error !== undefined && (
        <ErrorMessage error={error} prefix={`Couldn't restore the ${what}`} />
      )}
    </div>
  );
};

export default ArchivedBanner;
