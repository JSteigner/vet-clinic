import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import ArchivedBanner from '../../components/ArchivedBanner';
import ConfirmButton from '../../components/ConfirmButton';
import ErrorMessage from '../../components/ErrorMessage';
import NotFound from '../../components/NotFound';
import { SECONDARY_BUTTON } from '../../components/styles';
import type { OwnerQuery, OwnersQuery } from '../../gql/graphql';
import { isNotFound } from '../../lib/errors';
import { byName, speciesLabel } from '../../lib/format';
import PetForm from '../pets/PetForm';
import { CREATE_PET } from '../pets/queries';
import OwnerForm from './OwnerForm';
import { DELETE_OWNER, OWNER, RESTORE_OWNER, UPDATE_OWNER } from './queries';

/**
 * One owner: contact details (editable), their pets, adding a pet, and
 * archiving. An archived owner is read-only, with a button to restore them.
 */
const OwnerPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [addingPet, setAddingPet] = useState(false);

  const { data, error } = useQuery(OWNER, { variables: { id, includeArchived: true } });
  const [updateOwner, updateState] = useMutation(UPDATE_OWNER);
  const [createPet, createPetState] = useMutation(CREATE_PET, {
    // Add the new pet to this owner's cached pets.
    update: (cache, { data: result }) => {
      const pet = result?.createPet;
      if (!pet) return;

      cache.modify<NonNullable<OwnerQuery['owner']>>({
        id: cache.identify({ __typename: 'Owner', id }),
        fields: {
          pets: (existing, { toReference }) => {
            const ref = toReference(pet);
            return ref ? [...existing, ref] : existing;
          },
        },
      });
    },
  });
  const [deleteOwner, deleteState] = useMutation(DELETE_OWNER, {
    // Archived owners leave the (active) owners list.
    update: (cache, { data: result }) => {
      if (!result?.deleteOwner) return;

      cache.modify<OwnersQuery>({
        fields: {
          owners: (existing, { readField }) =>
            existing.filter((owner) => readField('id', owner) !== id),
        },
      });
    },
  });
  const [restoreOwner, restoreState] = useMutation(RESTORE_OWNER, {
    // Restored owners rejoin the owners list.
    update: (cache, { data: result }) => {
      const restored = result?.restoreOwner;
      if (!restored) return;

      cache.modify<OwnersQuery>({
        fields: {
          owners: (existing, { readField, toReference }) => {
            if (existing.some((owner) => readField('id', owner) === id)) return existing;

            const ref = toReference(restored);
            return ref ? [...existing, ref] : existing;
          },
        },
      });
    },
  });

  if (error) {
    return isNotFound(error) ? (
      <NotFound what="Owner" />
    ) : (
      <ErrorMessage error={error} prefix="Couldn't load the owner" />
    );
  }

  if (!data?.owner) return <p className="text-slate-500">Loading…</p>;

  const { owner } = data;
  // filter returns new arrays, so sorting them leaves the cached list alone.
  const activePets = owner.pets.filter(({ archivedAt }) => !archivedAt).sort(byName);
  const archivedPets = owner.pets.filter(({ archivedAt }) => archivedAt).sort(byName);

  const archive = async () => {
    // A failure is shown from deleteState.error, so it needs no handling here.
    const result = await deleteOwner({ variables: { id } }).catch(() => null);
    if (result?.data?.deleteOwner) navigate('/owners');
  };

  return (
    <section className="max-w-2xl space-y-6">
      <Link to="/owners" className="text-sm text-teal-700 hover:underline">
        ← All owners
      </Link>

      <h1 className="text-2xl font-semibold">{owner.name}</h1>

      {owner.archivedAt && (
        <ArchivedBanner
          archivedAt={owner.archivedAt}
          what="owner"
          busy={restoreState.loading}
          error={restoreState.error}
          onRestore={() => {
            restoreOwner({ variables: { id } }).catch(() => {});
          }}
        />
      )}

      {deleteState.error && (
        <ErrorMessage error={deleteState.error} prefix="Couldn't archive the owner" />
      )}

      {editing ? (
        <OwnerForm
          owner={owner}
          submitLabel="Save changes"
          busy={updateState.loading}
          error={updateState.error}
          onSubmit={(input) => {
            updateOwner({ variables: { id, input } })
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
          <dl className="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-2">
            <dt className="text-slate-500">Email</dt>
            <dd>{owner.email}</dd>
            <dt className="text-slate-500">Phone</dt>
            <dd>{owner.phone ?? '—'}</dd>
          </dl>
          {!owner.archivedAt && (
            <button type="button" onClick={() => setEditing(true)} className={SECONDARY_BUTTON}>
              Edit
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Pets</h2>
          {!addingPet && !owner.archivedAt && (
            <button type="button" onClick={() => setAddingPet(true)} className={SECONDARY_BUTTON}>
              Add pet
            </button>
          )}
        </div>

        {addingPet && (
          <PetForm
            submitLabel="Add pet"
            busy={createPetState.loading}
            error={createPetState.error}
            onSubmit={(values) => {
              createPet({ variables: { input: { ...values, ownerId: id } } })
                .then((result) => result.data && setAddingPet(false))
                .catch(() => {});
            }}
            onCancel={() => {
              setAddingPet(false);
              createPetState.reset();
            }}
          />
        )}

        {owner.pets.length === 0 ? (
          <p className="text-sm text-slate-500">No pets yet.</p>
        ) : (
          <ul
            aria-label="Pets"
            className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white"
          >
            {activePets.map(({ id: petId, name, species, breed }) => (
              <li key={petId} className="px-4 py-3">
                <Link to={`/pets/${petId}`} className="font-medium text-teal-700 hover:underline">
                  {name}
                </Link>{' '}
                <span className="text-sm text-slate-500">
                  {speciesLabel(species)}
                  {breed && ` · ${breed}`}
                </span>
              </li>
            ))}
            {archivedPets.map(({ id: petId, name, species }) => (
              <li key={petId} className="px-4 py-3 text-slate-400">
                <Link to={`/pets/${petId}`} className="hover:underline">
                  {name}
                </Link>{' '}
                <span className="text-sm">{speciesLabel(species)} · Archived</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!owner.archivedAt && (
        <div className="border-t border-slate-200 pt-4">
          <ConfirmButton
            label="Archive owner"
            question="Archive this owner and their pets, and cancel open visits?"
            disabled={deleteState.loading}
            onConfirm={() => void archive()}
          />
        </div>
      )}
    </section>
  );
};

export default OwnerPage;
