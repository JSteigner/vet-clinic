import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import ConfirmButton from '../../components/ConfirmButton';
import ErrorMessage from '../../components/ErrorMessage';
import NotFound from '../../components/NotFound';
import { SECONDARY_BUTTON } from '../../components/styles';
import type { VetsQuery } from '../../gql/graphql';
import { isNotFound } from '../../lib/errors';
import { DELETE_VET, UPDATE_VET, VET } from './queries';
import VetForm from './VetForm';
import VetSchedule from './VetSchedule';

/** One vet: details (editable), their schedule for a day, and deleting. */
const VetPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const { data, error } = useQuery(VET, { variables: { id } });
  const [updateVet, updateState] = useMutation(UPDATE_VET);
  const [deleteVet, deleteState] = useMutation(DELETE_VET, {
    // A deleted vet leaves the cached vets list.
    update: (cache, { data: result }) => {
      if (!result?.deleteVet) return;

      cache.modify<VetsQuery>({
        fields: {
          vets: (existing, { readField }) => existing.filter((vet) => readField('id', vet) !== id),
        },
      });
    },
  });

  if (error) {
    return isNotFound(error) ? (
      <NotFound what="Vet" />
    ) : (
      <ErrorMessage error={error} prefix="Couldn't load the vet" />
    );
  }

  if (!data?.vet) return <p className="text-slate-500">Loading…</p>;

  const { vet } = data;

  const remove = async () => {
    // A failure, e.g. "appointments still exist for this vet", is shown from deleteState.error.
    const result = await deleteVet({ variables: { id } }).catch(() => null);
    if (result?.data?.deleteVet) navigate('/vets');
  };

  return (
    <section className="max-w-2xl space-y-6">
      <Link to="/vets" className="text-sm text-teal-700 hover:underline">
        ← All vets
      </Link>

      <h1 className="text-2xl font-semibold">{vet.name}</h1>

      {editing ? (
        <VetForm
          vet={vet}
          submitLabel="Save changes"
          busy={updateState.loading}
          error={updateState.error}
          onSubmit={(input) => {
            updateVet({ variables: { id, input } })
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
            <dd>{vet.email}</dd>
          </dl>
          <button type="button" onClick={() => setEditing(true)} className={SECONDARY_BUTTON}>
            Edit
          </button>
        </div>
      )}

      <VetSchedule vetId={id} />

      <div className="space-y-3 border-t border-slate-200 pt-4">
        {deleteState.error && (
          <ErrorMessage error={deleteState.error} prefix="Couldn't delete the vet" />
        )}
        <ConfirmButton
          label="Delete vet"
          question="Delete this vet for good?"
          disabled={deleteState.loading}
          onConfirm={() => void remove()}
        />
      </div>
    </section>
  );
};

export default VetPage;
