import type { Species } from '../gql/graphql';

/** A species enum value for display, e.g. "DOG" → "Dog". */
export const speciesLabel = (species: Species): string =>
  species.charAt(0) + species.slice(1).toLowerCase();
