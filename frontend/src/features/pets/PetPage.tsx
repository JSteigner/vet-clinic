import { useMutation, useQuery } from '@apollo/client/react';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import ArchivedBanner from '../../components/ArchivedBanner';
import ConfirmButton from '../../components/ConfirmButton';
import ErrorMessage from '../../components/ErrorMessage';
import NotFound from '../../components/NotFound';
import { SECONDARY_BUTTON } from '../../components/styles';
import { isNotFound } from '../../lib/errors';
import { speciesLabel } from '../../lib/format';
import PetForm from './PetForm';
import PetHistory from './PetHistory';
import { DELETE_PET, PET, RESTORE_PET, UPDATE_PET } from './queries';

/**
 * One pet: details (editable), owner, visit history, and archiving. An
 * archived pet is read-only, with a button to restore it.
 */
const PetPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const { data, error } = useQuery(PET, { variables: { id, includeArchived: true } });
  const [updatePet, updateState] = useMutation(UPDATE_PET);
  // The archived pet stays in its owner's cached pets, now with archivedAt set.
  const [deletePet, deleteState] = useMutation(DELETE_PET);
  const [restorePet, restoreState] = useMutation(RESTORE_PET);

  if (error) {
    return isNotFound(error) ? (
      <NotFound what="Pet" />
    ) : (
      <ErrorMessage error={error} prefix="Couldn't load the pet" />
    );
  }

  if (!data?.pet) return <p className="text-slate-500">Loading…</p>;

  const { pet } = data;

  const archive = async () => {
    // A failure is shown from deleteState.error, so it needs no handling here.
    const result = await deletePet({ variables: { id } }).catch(() => null);
    if (result?.data?.deletePet) navigate(`/owners/${pet.owner.id}`);
  };

  return (
    <section className="max-w-2xl space-y-6">
      <Link to={`/owners/${pet.owner.id}`} className="text-sm text-teal-700 hover:underline">
        ← {pet.owner.name}
      </Link>

      <h1 className="text-2xl font-semibold">{pet.name}</h1>

      {pet.archivedAt && (
        <ArchivedBanner
          archivedAt={pet.archivedAt}
          what="pet"
          busy={restoreState.loading}
          error={restoreState.error}
          onRestore={() => {
            restorePet({ variables: { id } }).catch(() => {});
          }}
        />
      )}

      {deleteState.error && (
        <ErrorMessage error={deleteState.error} prefix="Couldn't archive the pet" />
      )}

      {editing ? (
        <PetForm
          pet={pet}
          submitLabel="Save changes"
          busy={updateState.loading}
          error={updateState.error}
          onSubmit={(input) => {
            updatePet({ variables: { id, input } })
              .then((result) => result.data && setEditing(false))
              .catch(() => {});
          }}
          onCancel={() => {
            setEditing(false);
            updateState.reset();
          }}
        />
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2">
            <dt className="text-slate-500">Species</dt>
            <dd>{speciesLabel(pet.species)}</dd>
            <dt className="text-slate-500">Breed</dt>
            <dd>{pet.breed ?? '—'}</dd>
            <dt className="text-slate-500">Born</dt>
            <dd>{pet.birthDate ? format(parseISO(pet.birthDate), 'MMMM d, yyyy') : '—'}</dd>
            <dt className="text-slate-500">Owner</dt>
            <dd>
              <Link to={`/owners/${pet.owner.id}`} className="text-teal-700 hover:underline">
                {pet.owner.name}
              </Link>
            </dd>
          </dl>
          {!pet.archivedAt && (
            <button type="button" onClick={() => setEditing(true)} className={SECONDARY_BUTTON}>
              Edit
            </button>
          )}
        </div>
      )}

      <PetHistory petId={id} />

      {!pet.archivedAt && (
        <div className="border-t border-slate-200 pt-4">
          <ConfirmButton
            label="Archive pet"
            question="Archive this pet and cancel its open visits?"
            disabled={deleteState.loading}
            onConfirm={() => void archive()}
          />
        </div>
      )}
    </section>
  );
};

export default PetPage;
