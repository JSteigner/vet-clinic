import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import ErrorMessage from '../../components/ErrorMessage';
import { PRIMARY_BUTTON } from '../../components/styles';
import type { CreateOwnerInput, OwnersQuery } from '../../gql/graphql';
import { byName } from '../../lib/format';
import OwnerForm from './OwnerForm';
import { CREATE_OWNER, OWNERS } from './queries';

/** Active owners by name, with a form to add one. */
const OwnersPage = () => {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const { data, error } = useQuery(OWNERS);
  const [createOwner, { loading: creating, error: createError, reset }] = useMutation(
    CREATE_OWNER,
    {
      // Add the new owner to the cached list, so it's there on the way back.
      update: (cache, { data: result }) => {
        const owner = result?.createOwner;
        if (!owner) return;

        cache.modify<OwnersQuery>({
          fields: {
            owners: (existing, { toReference }) => {
              const ref = toReference(owner);
              return ref ? [...existing, ref] : existing;
            },
          },
        });
      },
    },
  );

  const create = async (input: CreateOwnerInput) => {
    // A failure is shown in the form from createError, so it needs no handling here.
    const result = await createOwner({ variables: { input } }).catch(() => null);
    const owner = result?.data?.createOwner;
    if (owner) navigate(`/owners/${owner.id}`);
  };

  // Sorted here too: a newly added owner is appended to the end of the cached list.
  const owners = data ? [...data.owners].sort(byName) : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Owners</h1>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className={PRIMARY_BUTTON}>
            Add owner
          </button>
        )}
      </div>

      {adding && (
        <OwnerForm
          submitLabel="Add owner"
          busy={creating}
          error={createError}
          onSubmit={(input) => void create(input)}
          onCancel={() => {
            setAdding(false);
            reset();
          }}
        />
      )}

      {error ? (
        <ErrorMessage error={error} prefix="Couldn't load the owners" />
      ) : !data ? (
        <p className="text-slate-500">Loading…</p>
      ) : owners.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-slate-500">
          No owners yet.
        </p>
      ) : (
        <ul
          aria-label="Owners"
          className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white"
        >
          {owners.map(({ id, name, email, phone, pets }) => {
            const activePets = pets.filter(({ archivedAt }) => !archivedAt).length;

            return (
              <li key={id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <Link to={`/owners/${id}`} className="font-medium text-teal-700 hover:underline">
                    {name}
                  </Link>
                  <p className="truncate text-sm text-slate-500">
                    {email}
                    {phone && ` · ${phone}`}
                  </p>
                </div>
                <span className="text-sm text-slate-500">
                  {activePets} {activePets === 1 ? 'pet' : 'pets'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default OwnersPage;
