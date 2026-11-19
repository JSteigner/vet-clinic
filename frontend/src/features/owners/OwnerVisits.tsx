import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import VisitList, { type VisitFilter } from '../../components/VisitList';
import { OWNER_APPOINTMENTS } from './queries';

/** The visits of all of an owner's pets, oldest first, upcoming ones by default. */
const OwnerVisits = ({ ownerId }: { ownerId: string }) => {
  const [filter, setFilter] = useState<VisitFilter>('SCHEDULED');

  const { data, error } = useQuery(OWNER_APPOINTMENTS, {
    // Leave status out for all visits: the API filters on it whenever it's sent.
    variables: filter
      ? { ownerId, status: filter, includeArchived: true }
      : { ownerId, includeArchived: true },
    // The server filters this list, so refetch it rather than trust the cache.
    fetchPolicy: 'cache-and-network',
  });

  const visits = data?.ownerAppointments.map(({ id, startsAt, status, reason, pet, vet }) => ({
    id,
    startsAt,
    status,
    detail: `${pet.name} with ${vet.name} · ${reason}`,
  }));

  return <VisitList visits={visits} error={error} filter={filter} onFilterChange={setFilter} />;
};

export default OwnerVisits;
