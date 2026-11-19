import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import VisitList, { type VisitFilter } from '../../components/VisitList';
import { PET_APPOINTMENTS } from './queries';

/** A pet's visits, oldest first, optionally filtered by status. */
const PetHistory = ({ petId }: { petId: string }) => {
  const [filter, setFilter] = useState<VisitFilter>('');

  const { data, error } = useQuery(PET_APPOINTMENTS, {
    // Leave status out for all visits: the API filters on it whenever it's sent.
    variables: filter
      ? { petId, status: filter, includeArchived: true }
      : { petId, includeArchived: true },
    // The server filters this list, so refetch it rather than trust the cache.
    fetchPolicy: 'cache-and-network',
  });

  const visits = data?.petAppointments.map(({ id, startsAt, status, reason, vet }) => ({
    id,
    startsAt,
    status,
    detail: `${vet.name} · ${reason}`,
  }));

  return <VisitList visits={visits} error={error} filter={filter} onFilterChange={setFilter} />;
};

export default PetHistory;
