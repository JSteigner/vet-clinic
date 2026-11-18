import { useEffect, useState } from 'react';

import type { SearchQuery, SearchType } from '../../gql/graphql';
import { speciesLabel } from '../../lib/format';

/** `value`, updated only once it has stopped changing for `delayMs`. */
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

export type ParsedSearch = {
  /** The words left after the keywords, or null when under 2 characters. */
  term: string | null;
  archived: boolean;
  /** The groups to search, or null for all of them. */
  types: SearchType[] | null;
  /** Whether there's anything to ask the API for. */
  searchable: boolean;
};

const TYPE_KEYWORDS: Record<string, SearchType> = {
  owner: 'OWNER',
  owners: 'OWNER',
  pet: 'PET',
  pets: 'PET',
  vet: 'VET',
  vets: 'VET',
};

const isKeyword = (word: string) => word === 'archived' || word in TYPE_KEYWORDS;

/**
 * Reads the search keywords: "archived" searches archived records, and
 * "owner(s)", "pet(s)" or "vet(s)" narrow the groups. The other words are the
 * term, so "archived pets" lists archived pets and "archived rex" finds
 * archived records matching "rex".
 */
export const parseSearch = (text: string): ParsedSearch => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lower = words.map((word) => word.toLowerCase());

  const archived = lower.includes('archived');
  const typeWords = lower.filter((word) => word in TYPE_KEYWORDS);
  const rest = words.filter((_word, i) => !isKeyword(lower[i])).join(' ');

  const types =
    typeWords.length > 0 ? [...new Set(typeWords.map((word) => TYPE_KEYWORDS[word]))] : null;
  const term = rest.length >= 2 ? rest : null;

  return { term, archived, types, searchable: term !== null || archived || types !== null };
};

/** Whether a search asks for archived vets, which don't exist. */
export const asksForArchivedVets = ({ archived, types }: ParsedSearch): boolean =>
  archived && (types?.includes('VET') ?? false);

export type SearchResult = {
  key: string;
  href: string;
  name: string;
  detail: string;
  archived: boolean;
};

export type SearchGroup = { label: string; results: SearchResult[] };

/** The search results as labeled groups of rows, leaving out empty groups. */
export const groupResults = ({ owners, pets, vets }: SearchQuery['search']): SearchGroup[] =>
  [
    {
      label: 'Owners',
      results: owners.map(({ id, name, email, phone, archivedAt }) => ({
        key: `owner-${id}`,
        href: `/owners/${id}`,
        name,
        detail: phone ? `${email} · ${phone}` : email,
        archived: archivedAt !== null,
      })),
    },
    {
      label: 'Pets',
      results: pets.map(({ id, name, species, archivedAt, owner }) => ({
        key: `pet-${id}`,
        href: `/pets/${id}`,
        name,
        detail: `${speciesLabel(species)} · ${owner.name}`,
        archived: archivedAt !== null,
      })),
    },
    {
      label: 'Vets',
      results: vets.map(({ id, name, email }) => ({
        key: `vet-${id}`,
        href: `/vets/${id}`,
        name,
        detail: email,
        archived: false,
      })),
    },
  ].filter(({ results }) => results.length > 0);
