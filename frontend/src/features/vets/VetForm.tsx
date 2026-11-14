import { type SubmitEvent, useState } from 'react';

import ErrorMessage from '../../components/ErrorMessage';
import Field from '../../components/Field';
import { INPUT, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../components/styles';
import type { CreateVetInput, VetForm_VetFragment } from '../../gql/graphql';
import { fieldErrors } from '../../lib/errors';

type Props = {
  /** The vet to edit; leave out to add one. */
  vet?: VetForm_VetFragment;
  submitLabel: string;
  busy: boolean;
  /** The last mutation's error, shown per field where the API names one. */
  error?: unknown;
  onSubmit: (input: CreateVetInput) => void;
  onCancel: () => void;
};

/** Name and email for adding or editing a vet. */
const VetForm = ({ vet, submitLabel, busy, error, onSubmit, onCancel }: Props) => {
  // Draft values, seeded from the vet being edited.
  const [name, setName] = useState(vet?.name ?? '');
  const [email, setEmail] = useState(vet?.email ?? '');
  const errors = fieldErrors(error);

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ name, email });
  };

  return (
    <form
      onSubmit={submit}
      aria-label={vet ? 'Edit vet' : 'New vet'}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      {error !== undefined && Object.keys(errors).length === 0 && (
        <ErrorMessage error={error} prefix="Couldn't save the vet" />
      )}

      <Field label="Name" htmlFor="vet-name" error={errors.name}>
        <input
          id="vet-name"
          required
          value={name}
          aria-invalid={Boolean(errors.name)}
          onChange={(event) => setName(event.target.value)}
          className={INPUT}
        />
      </Field>

      <Field label="Email" htmlFor="vet-email" error={errors.email}>
        <input
          id="vet-email"
          type="email"
          required
          value={email}
          aria-invalid={Boolean(errors.email)}
          onChange={(event) => setEmail(event.target.value)}
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

export default VetForm;
