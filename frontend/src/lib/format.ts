import type { AppointmentStatus, Species } from '../gql/graphql';

/** The status filters for a list of visits; an empty status shows them all. */
export const VISIT_FILTERS: { label: string; status: AppointmentStatus | '' }[] = [
  { label: 'All visits', status: '' },
  { label: 'Upcoming', status: 'SCHEDULED' },
  { label: 'Checked in', status: 'CHECKED_IN' },
  { label: 'Completed', status: 'COMPLETED' },
  { label: 'Cancelled', status: 'CANCELLED' },
];

/** Every species, in the order the pet form offers them. */
export const SPECIES: Species[] = ['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER'];

/** A species enum value for display, e.g. "DOG" → "Dog". */
export const speciesLabel = (species: Species): string =>
  species.charAt(0) + species.slice(1).toLowerCase();

/**
 * Compares by name, alphabetically and language-aware, for `sort`. Sort a copy
 * (`[...list].sort(byName)`): query results from the cache are read-only.
 */
export const byName = <T extends { name: string }>(a: T, b: T): number =>
  a.name.localeCompare(b.name);
