import { useMutation, useQuery } from '@apollo/client/react';
import { Link, useNavigate, useParams } from 'react-router';

import ConfirmButton from '../../components/ConfirmButton';
import ErrorMessage from '../../components/ErrorMessage';
import NotFound from '../../components/NotFound';
import StatusActions from '../../components/StatusActions';
import StatusBadge from '../../components/StatusBadge';
import { isNotFound } from '../../lib/errors';
import { speciesLabel } from '../../lib/format';
import { formatInZone, useClinicTimeZone } from '../../lib/time';
import { UPDATE_APPOINTMENT_STATUS } from '../schedule/queries';
import AppointmentEditForm from './AppointmentEditForm';
import { APPOINTMENT, DELETE_APPOINTMENT } from './queries';

/** One visit: its details, status actions, editing while scheduled, and delete. */
const AppointmentPage = () => {
  const { id = '' } = useParams();
  const timeZone = useClinicTimeZone();
  const navigate = useNavigate();

  const { data, error } = useQuery(APPOINTMENT, { variables: { id } });
  const [updateStatus, { loading: updating, error: statusError }] =
    useMutation(UPDATE_APPOINTMENT_STATUS);
  const [deleteAppointment, { loading: deleting, error: deleteError }] =
    useMutation(DELETE_APPOINTMENT);

  if (error) {
    return isNotFound(error) ? (
      <NotFound what="Appointment" />
    ) : (
      <ErrorMessage error={error} prefix="Couldn't load the appointment" />
    );
  }

  if (!data?.appointment || !timeZone) return <p className="text-slate-500">Loading…</p>;

  const { appointment, vets } = data;
  const { startsAt, reason, status, pet, vet } = appointment;
  const day = formatInZone(startsAt, timeZone, 'yyyy-MM-dd');

  const remove = async () => {
    // A failure is shown from deleteError, so the rejected promise needs no handling.
    const result = await deleteAppointment({ variables: { id } }).catch(() => null);
    // The schedule refetches its day when it opens, so it won't show this visit.
    if (result?.data?.deleteAppointment) navigate(`/?date=${day}`);
  };

  return (
    <section className="max-w-2xl space-y-6">
      <Link to={`/?date=${day}`} className="text-sm text-teal-700 hover:underline">
        ← Back to the schedule
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">
          {pet.name} with {vet.name}
        </h1>
        <StatusBadge status={status} />
      </div>

      {statusError && <ErrorMessage error={statusError} prefix="Couldn't update the visit" />}
      {deleteError && <ErrorMessage error={deleteError} prefix="Couldn't delete the visit" />}

      <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <dt className="text-slate-500">When</dt>
        <dd>{formatInZone(startsAt, timeZone, "EEEE, MMMM d, yyyy 'at' h:mm a")}</dd>
        <dt className="text-slate-500">Pet</dt>
        <dd>
          <Link to={`/pets/${pet.id}`} className="text-teal-700 hover:underline">
            {pet.name}
          </Link>{' '}
          ({speciesLabel(pet.species)})
        </dd>
        <dt className="text-slate-500">Owner</dt>
        <dd>
          <Link to={`/owners/${pet.owner.id}`} className="text-teal-700 hover:underline">
            {pet.owner.name}
          </Link>
        </dd>
        <dt className="text-slate-500">Vet</dt>
        <dd>
          <Link to={`/vets/${vet.id}`} className="text-teal-700 hover:underline">
            {vet.name}
          </Link>
        </dd>
        <dt className="text-slate-500">Reason</dt>
        <dd>{reason}</dd>
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <StatusActions
          status={status}
          busy={updating}
          onChange={(next) => {
            updateStatus({ variables: { id, status: next } }).catch(() => {});
          }}
        />
      </div>

      {status === 'SCHEDULED' && (
        <AppointmentEditForm appointment={appointment} vets={vets} timeZone={timeZone} />
      )}

      <div className="border-t border-slate-200 pt-4">
        <ConfirmButton
          label="Delete appointment"
          question="Delete it for good? Cancelling keeps a record."
          disabled={deleting}
          onConfirm={() => void remove()}
        />
      </div>
    </section>
  );
};

export default AppointmentPage;
