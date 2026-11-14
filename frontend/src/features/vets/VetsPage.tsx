import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import ErrorMessage from '../../components/ErrorMessage';
import { PRIMARY_BUTTON } from '../../components/styles';
import type { CreateVetInput, VetsQuery } from '../../gql/graphql';
import { byName } from '../../lib/format';
import { CREATE_VET, VETS } from './queries';
import VetForm from './VetForm';

/** The clinic's vets by name, with a form to add one. */
const VetsPage = () => {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const { data, error } = useQuery(VETS);
  const [createVet, { loading: creating, error: createError, reset }] = useMutation(CREATE_VET, {
    // Add the new vet to the cached list; the booking and edit forms read it too.
    update: (cache, { data: result }) => {
      const vet = result?.createVet;
      if (!vet) return;

      cache.modify<VetsQuery>({
        fields: {
          vets: (existing, { toReference }) => {
            const ref = toReference(vet);
            return ref ? [...existing, ref] : existing;
          },
        },
      });
    },
  });

  const create = async (input: CreateVetInput) => {
    // A failure is shown in the form from createError, so it needs no handling here.
    const result = await createVet({ variables: { input } }).catch(() => null);
    const vet = result?.data?.createVet;
    if (vet) navigate(`/vets/${vet.id}`);
  };

  // Sorted here too: a newly added vet is appended to the end of the cached list.
  const vets = data ? [...data.vets].sort(byName) : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Vets</h1>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className={PRIMARY_BUTTON}>
            Add vet
          </button>
        )}
      </div>

      {adding && (
        <VetForm
          submitLabel="Add vet"
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
        <ErrorMessage error={error} prefix="Couldn't load the vets" />
      ) : !data ? (
        <p className="text-slate-500">Loading…</p>
      ) : vets.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-slate-500">
          No vets yet.
        </p>
      ) : (
        <ul
          aria-label="Vets"
          className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white"
        >
          {vets.map(({ id, name, email }) => (
            <li key={id} className="px-4 py-3">
              <Link to={`/vets/${id}`} className="font-medium text-teal-700 hover:underline">
                {name}
              </Link>
              <p className="text-sm text-slate-500">{email}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default VetsPage;
