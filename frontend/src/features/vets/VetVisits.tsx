import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import VisitList, { type VisitFilter } from '../../components/VisitList';
import { VET_APPOINTMENTS } from './queries';

/** All of a vet's visits on any day, oldest first, upcoming ones by default. */
const VetVisits = ({ vetId }: { vetId: string }) => {
  const [filter, setFilter] = useState<VisitFilter>('SCHEDULED');

  const { data, error } = useQuery(VET_APPOINTMENTS, {
    // Leave status out for all visits: the API filters on it whenever it's sent.
    variables: filter ? { vetId, status: filter } : { vetId },
    // The server filters this list, so refetch it rather than trust the cache.
    fetchPolicy: 'cache-and-network',
  });

  const visits = data?.vetAppointments.map(({ id, startsAt, status, reason, pet }) => ({
    id,
    startsAt,
    status,
    detail: `${pet.name} (${pet.owner.name}) · ${reason}`,
  }));

  return <VisitList visits={visits} error={error} filter={filter} onFilterChange={setFilter} />;
};

export default VetVisits;
