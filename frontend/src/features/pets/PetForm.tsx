import { type SubmitEvent, useState } from 'react';

import ErrorMessage from '../../components/ErrorMessage';
import Field from '../../components/Field';
import { INPUT, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../components/styles';
import type { CreatePetInput, PetForm_PetFragment, Species } from '../../gql/graphql';
import { fieldErrors } from '../../lib/errors';
import { SPECIES, speciesLabel } from '../../lib/format';

/** The pet's own fields; the page that uses the form knows the owner. */
export type PetFormValues = Omit<CreatePetInput, 'ownerId'>;

type Props = {
  /** The pet to edit; leave out to add one. */
  pet?: PetForm_PetFragment;
  submitLabel: string;
  busy: boolean;
  /** The last mutation's error, shown per field where the API names one. */
  error?: unknown;
  onSubmit: (values: PetFormValues) => void;
  onCancel: () => void;
};

/** Name, species, breed and birth date for adding or editing a pet. */
const PetForm = ({ pet, submitLabel, busy, error, onSubmit, onCancel }: Props) => {
  // Draft values, seeded from the pet being edited.
  const [name, setName] = useState(pet?.name ?? '');
  const [species, setSpecies] = useState<Species>(pet?.species ?? 'DOG');
  const [breed, setBreed] = useState(pet?.breed ?? '');
  const [birthDate, setBirthDate] = useState(pet?.birthDate ?? '');
  const errors = fieldErrors(error);

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ name, species, breed: breed || null, birthDate: birthDate || null });
  };

  return (
    <form
      onSubmit={submit}
      aria-label={pet ? 'Edit pet' : 'New pet'}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      {error !== undefined && Object.keys(errors).length === 0 && (
        <ErrorMessage error={error} prefix="Couldn't save the pet" />
      )}

      <Field label="Name" htmlFor="pet-name" error={errors.name}>
        <input
          id="pet-name"
          required
          value={name}
          aria-invalid={Boolean(errors.name)}
          onChange={(event) => setName(event.target.value)}
          className={INPUT}
        />
      </Field>

      <Field label="Species" htmlFor="pet-species" error={errors.species}>
        <select
          id="pet-species"
          value={species}
          aria-invalid={Boolean(errors.species)}
          onChange={(event) => setSpecies(event.target.value as Species)}
          className={INPUT}
        >
          {SPECIES.map((value) => (
            <option key={value} value={value}>
              {speciesLabel(value)}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Breed (optional)" htmlFor="pet-breed" error={errors.breed}>
        <input
          id="pet-breed"
          value={breed}
          aria-invalid={Boolean(errors.breed)}
          onChange={(event) => setBreed(event.target.value)}
          className={INPUT}
        />
      </Field>

      <Field label="Birth date (optional)" htmlFor="pet-birth-date" error={errors.birthDate}>
        <input
          id="pet-birth-date"
          type="date"
          value={birthDate}
          aria-invalid={Boolean(errors.birthDate)}
          onChange={(event) => setBirthDate(event.target.value)}
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

export default PetForm;
