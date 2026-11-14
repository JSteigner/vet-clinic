import { type FormEvent, useState } from 'react';

import ErrorMessage from '../../components/ErrorMessage';
import Field from '../../components/Field';
import { INPUT, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../components/styles';
import type { CreateOwnerInput, OwnerForm_OwnerFragment } from '../../gql/graphql';
import { fieldErrors } from '../../lib/errors';

type Props = {
  /** The owner to edit; leave out to create one. */
  owner?: OwnerForm_OwnerFragment;
  submitLabel: string;
  busy: boolean;
  /** The last mutation's error, shown per field where the API names one. */
  error?: unknown;
  onSubmit: (input: CreateOwnerInput) => void;
  onCancel: () => void;
};

/** Name, email and phone for creating or editing an owner. */
const OwnerForm = ({ owner, submitLabel, busy, error, onSubmit, onCancel }: Props) => {
  // Draft values, seeded from the owner being edited.
  const [name, setName] = useState(owner?.name ?? '');
  const [email, setEmail] = useState(owner?.email ?? '');
  const [phone, setPhone] = useState(owner?.phone ?? '');
  const errors = fieldErrors(error);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ name, email, phone: phone || null });
  };

  return (
    <form
      onSubmit={submit}
      aria-label={owner ? 'Edit owner' : 'New owner'}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      {error !== undefined && Object.keys(errors).length === 0 && (
        <ErrorMessage error={error} prefix="Couldn't save the owner" />
      )}

      <Field label="Name" htmlFor="owner-name" error={errors.name}>
        <input
          id="owner-name"
          required
          value={name}
          aria-invalid={Boolean(errors.name)}
          onChange={(event) => setName(event.target.value)}
          className={INPUT}
        />
      </Field>

      <Field label="Email" htmlFor="owner-email" error={errors.email}>
        <input
          id="owner-email"
          type="email"
          required
          value={email}
          aria-invalid={Boolean(errors.email)}
          onChange={(event) => setEmail(event.target.value)}
          className={INPUT}
        />
      </Field>

      <Field label="Phone (optional)" htmlFor="owner-phone" error={errors.phone}>
        <input
          id="owner-phone"
          type="tel"
          value={phone}
          aria-invalid={Boolean(errors.phone)}
          onChange={(event) => setPhone(event.target.value)}
          className={INPUT}
        />
      </Field>

      <div className="flex gap-3">
        <button type="submit" disabled={busy} className={PRIMARY_BUTTON}>
          {busy ? 'Saving…' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className={SECONDARY_BUTTON}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default OwnerForm;
