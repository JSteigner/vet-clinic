import { useMutation } from '@apollo/client/react';
import { type FormEvent, useState } from 'react';

import ErrorMessage from '../../components/ErrorMessage';
import Field from '../../components/Field';
import { INPUT, PRIMARY_BUTTON } from '../../components/styles';
import type {
  AppointmentEditForm_AppointmentFragment,
  AppointmentEditForm_VetFragment,
} from '../../gql/graphql';
import { fieldErrors } from '../../lib/errors';
import { fromWallTime, toWallTime } from '../../lib/time';
import { UPDATE_APPOINTMENT } from './queries';

type Props = {
  appointment: AppointmentEditForm_AppointmentFragment;
  vets: AppointmentEditForm_VetFragment[];
  timeZone: string;
};

/** Reschedule a visit, or change its vet or reason. The pet can't change. */
const AppointmentEditForm = ({ appointment, vets, timeZone }: Props) => {
  // Draft values, seeded once from the appointment and saved on submit.
  const [startsAt, setStartsAt] = useState(toWallTime(appointment.startsAt, timeZone));
  const [vetId, setVetId] = useState(appointment.vet.id);
  const [reason, setReason] = useState(appointment.reason);
  const [saved, setSaved] = useState(false);

  const [updateAppointment, { loading, error }] = useMutation(UPDATE_APPOINTMENT);
  const errors = fieldErrors(error);

  const edit = (update: () => void) => {
    update();
    setSaved(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = { startsAt: fromWallTime(startsAt, timeZone), vetId, reason };
    // A failure is shown from `error`, so the rejected promise needs no handling.
    const result = await updateAppointment({
      variables: { id: appointment.id, input },
    }).catch(() => null);
    setSaved(Boolean(result?.data?.updateAppointment));
  };

  return (
    <form
      onSubmit={submit}
      aria-label="Edit appointment"
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <h2 className="font-semibold">Reschedule or edit</h2>

      {error && Object.keys(errors).length === 0 && (
        <ErrorMessage error={error} prefix="Couldn't save the changes" />
      )}

      <Field label={`Date and time (${timeZone})`} htmlFor="edit-starts-at" error={errors.startsAt}>
        <input
          id="edit-starts-at"
          type="datetime-local"
          required
          value={startsAt}
          aria-invalid={Boolean(errors.startsAt)}
          onChange={(event) => edit(() => setStartsAt(event.target.value))}
          className={INPUT}
        />
      </Field>

      <Field label="Vet" htmlFor="edit-vet" error={errors.vetId}>
        <select
          id="edit-vet"
          value={vetId}
          aria-invalid={Boolean(errors.vetId)}
          onChange={(event) => edit(() => setVetId(event.target.value))}
          className={INPUT}
        >
          {vets.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Reason" htmlFor="edit-reason" error={errors.reason}>
        <textarea
          id="edit-reason"
          required
          rows={2}
          value={reason}
          aria-invalid={Boolean(errors.reason)}
          onChange={(event) => edit(() => setReason(event.target.value))}
          className={INPUT}
        />
      </Field>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className={PRIMARY_BUTTON}>
          {loading ? 'Saving…' : 'Save changes'}
        </button>
        {saved && (
          <p role="status" className="text-sm text-emerald-700">
            Saved.
          </p>
        )}
      </div>
    </form>
  );
};

export default AppointmentEditForm;
