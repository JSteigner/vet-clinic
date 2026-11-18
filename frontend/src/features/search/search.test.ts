import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { asksForArchivedVets, groupResults, parseSearch, useDebouncedValue } from './search';

describe('parseSearch', () => {
  test('uses the whole text as the term', () => {
    expect(parseSearch('  Rex Hale ')).toEqual({
      term: 'Rex Hale',
      archived: false,
      types: null,
      searchable: true,
    });
  });

  test('has nothing to search under 2 characters', () => {
    expect(parseSearch(' r ')).toEqual({
      term: null,
      archived: false,
      types: null,
      searchable: false,
    });
  });

  test('reads "archived" and type keywords, in any case, as filters', () => {
    expect(parseSearch('Archived PETS rex')).toEqual({
      term: 'rex',
      archived: true,
      types: ['PET'],
      searchable: true,
    });
  });

  test('lists a group or archived records without a term', () => {
    expect(parseSearch('archived')).toMatchObject({ term: null, archived: true, searchable: true });
    expect(parseSearch('vets')).toMatchObject({ term: null, types: ['VET'], searchable: true });
  });

  test('combines type keywords, singular or plural, once each', () => {
    expect(parseSearch('owner pets owners').types).toEqual(['OWNER', 'PET']);
  });
});

describe('asksForArchivedVets', () => {
  test('is true only for an archived search that includes vets', () => {
    expect(asksForArchivedVets(parseSearch('archived vets'))).toBe(true);
    expect(asksForArchivedVets(parseSearch('archived'))).toBe(false);
    expect(asksForArchivedVets(parseSearch('vets'))).toBe(false);
  });
});

describe('groupResults', () => {
  test('makes labeled rows, leaving out empty groups', () => {
    const groups = groupResults({
      __typename: 'SearchResults',
      owners: [
        {
          __typename: 'Owner',
          id: '20',
          name: 'Ana Lima',
          email: 'ana@example.com',
          phone: '555-0100',
          archivedAt: null,
        },
        {
          __typename: 'Owner',
          id: '21',
          name: 'Ben Cho',
          email: 'ben@example.com',
          phone: null,
          archivedAt: '2026-11-14T18:00:00Z',
        },
      ],
      pets: [],
      vets: [{ __typename: 'Vet', id: '30', name: 'Dr. Kim', email: 'kim@example.com' }],
    });

    expect(groups).toEqual([
      {
        label: 'Owners',
        results: [
          {
            key: 'owner-20',
            href: '/owners/20',
            name: 'Ana Lima',
            detail: 'ana@example.com · 555-0100',
            archived: false,
          },
          {
            key: 'owner-21',
            href: '/owners/21',
            name: 'Ben Cho',
            detail: 'ben@example.com',
            archived: true,
          },
        ],
      },
      {
        label: 'Vets',
        results: [
          {
            key: 'vet-30',
            href: '/vets/30',
            name: 'Dr. Kim',
            detail: 'kim@example.com',
            archived: false,
          },
        ],
      },
    ]);
  });
});

describe('useDebouncedValue', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('updates only once the value stops changing for the delay', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: 'r' },
    });

    rerender({ value: 're' });
    act(() => vi.advanceTimersByTime(300));
    rerender({ value: 'rex' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('r');

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('rex');
  });
});
