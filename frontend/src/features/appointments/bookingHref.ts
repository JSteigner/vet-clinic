import { matchPath } from 'react-router';

/**
 * The booking form's URL for the page at `pathname` and `search`: an owner's,
 * pet's or vet's page fills in that record, and the schedule or a vet's page
 * the day it shows.
 */
export const bookingHref = (pathname: string, search: string): string => {
  const params = new URLSearchParams();
  const date = new URLSearchParams(search).get('date');
  const owner = matchPath('/owners/:id', pathname);
  const pet = matchPath('/pets/:id', pathname);
  const vet = matchPath('/vets/:id', pathname);

  if (owner?.params.id) params.set('ownerId', owner.params.id);
  if (pet?.params.id) params.set('petId', pet.params.id);
  if (vet?.params.id) params.set('vetId', vet.params.id);
  if (date && (pathname === '/' || vet)) params.set('date', date);

  const query = params.toString();
  return query ? `/appointments/new?${query}` : '/appointments/new';
};
