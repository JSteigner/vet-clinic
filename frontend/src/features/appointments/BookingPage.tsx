import { useMutation, useQuery } from '@apollo/client/react';
import { type SubmitEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import ErrorMessage from '../../components/ErrorMessage';
import Field from '../../components/Field';
import { INPUT, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../components/styles';
import { fieldErrors } from '../../lib/errors';
import { fromWallTime, useClinicTimeZone } from '../../lib/time';
import { BOOKING_OPTIONS, CREATE_APPOINTMENT, OWNER_PETS } from './queries';

/** Books a visit: an owner, then one of their pets, a vet, a time and a reason. */
const BookingPage = () => {
  const timeZone = useClinicTimeZone();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const day = searchParams.get('date');

  const [ownerId, setOwnerId] = useState('');
  const [petId, setPetId] = useState('');
  const [vetId, setVetId] = useState('');
  const [startsAt, setStartsAt] = useState(day ? `${day}T09:00` : '');
  const [reason, setReason] = useState('');

  const { data: options, error: optionsError } = useQuery(BOOKING_OPTIONS);
  const { data: petsData } = useQuery(OWNER_PETS, { variables: { ownerId }, skip: !ownerId });
  const [createAppointment, { loading, error }] = useMutation(CREATE_APPOINTMENT);
  const errors = fieldErrors(error);

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!timeZone) return;

    const input = { petId, vetId, startsAt: fromWallTime(startsAt, timeZone), reason };
    // A failure is shown from `error`, so the rejected promise needs no handling.
    const result = await createAppointment({ variables: { input } }).catch(() => null);
    if (result?.data?.createAppointment) navigate(`/?date=${startsAt.slice(0, 10)}`);
  };

  if (optionsError) return <ErrorMessage error={optionsError} prefix="Couldn't load the form" />;

  return (
    <section className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Book an appointment</h1>

      {error && Object.keys(errors).length === 0 && (
        <ErrorMessage error={error} prefix="Couldn't book the visit" />
      )}

      <form onSubmit={submit} className="space-y-4">
        <Field label="Owner" htmlFor="owner">
          <select
            id="owner"
            required
            value={ownerId}
            onChange={(event) => {
              setOwnerId(event.target.value);
              setPetId('');
            }}
            className={INPUT}
          >
            <option value="">Choose an owner</option>
            {options?.owners.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Pet" htmlFor="pet" error={errors.petId}>
          <select
            id="pet"
            required
            disabled={!ownerId}
            value={petId}
            aria-invalid={Boolean(errors.petId)}
            onChange={(event) => setPetId(event.target.value)}
            className={INPUT}
          >
            <option value="">{ownerId ? 'Choose a pet' : 'Choose an owner first'}</option>
            {petsData?.ownerPets.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Vet" htmlFor="vet" error={errors.vetId}>
          <select
            id="vet"
            required
            value={vetId}
            aria-invalid={Boolean(errors.vetId)}
            onChange={(event) => setVetId(event.target.value)}
            className={INPUT}
          >
            <option value="">Choose a vet</option>
            {options?.vets.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={timeZone ? `Date and time (${timeZone})` : 'Date and time'}
          htmlFor="starts-at"
          error={errors.startsAt}
        >
          <input
            id="starts-at"
            type="datetime-local"
            required
            value={startsAt}
            aria-invalid={Boolean(errors.startsAt)}
            onChange={(event) => setStartsAt(event.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Reason" htmlFor="reason" error={errors.reason}>
          <textarea
            id="reason"
            required
            rows={3}
            value={reason}
            aria-invalid={Boolean(errors.reason)}
            onChange={(event) => setReason(event.target.value)}
            className={INPUT}
          />
        </Field>

        <div className="flex gap-3">
          <button type="submit" disabled={loading || !timeZone} className={PRIMARY_BUTTON}>
            {loading ? 'Booking…' : 'Book appointment'}
          </button>
          <Link to={day ? `/?date=${day}` : '/'} className={SECONDARY_BUTTON}>
            Back to schedule
          </Link>
        </div>
      </form>
    </section>
  );
};

export default BookingPage;
