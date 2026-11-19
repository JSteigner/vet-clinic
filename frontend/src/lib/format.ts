import type { Species } from '../gql/graphql';

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
