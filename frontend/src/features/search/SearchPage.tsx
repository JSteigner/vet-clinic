import { useQuery } from '@apollo/client/react';
import type { SubmitEvent } from 'react';
import { Link, useSearchParams } from 'react-router';

import ErrorMessage from '../../components/ErrorMessage';
import { INPUT, PRIMARY_BUTTON } from '../../components/styles';
import { SEARCH } from './queries';
import ResultLabel from './ResultLabel';
import { asksForArchivedVets, groupResults, parseSearch } from './search';

const LIMIT = 50;

/**
 * All search results, up to 50 per group, for `?q=` (with the same keywords
 * as the header search). `&archived=1`, from the "Include archived" box, adds
 * archived owners and pets to the active ones.
 */
const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const search = parseSearch(q);
  const includeArchived = params.get('archived') === '1';

  const { data, loading, error } = useQuery(SEARCH, {
    variables: {
      term: search.term,
      archived: search.archived,
      includeArchived,
      types: search.types,
      limit: LIMIT,
    },
    skip: !search.searchable,
  });

  const groups = data ? groupResults(data.search) : [];

  const setSearch = (text: string, archivedToo: boolean) =>
    setParams(archivedToo ? { q: text, archived: '1' } : { q: text });

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = new FormData(event.currentTarget).get('q');
    setSearch(typeof text === 'string' ? text.trim() : '', includeArchived);
  };

  return (
    <section className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Search</h1>

      {/* Keyed by q, so the box shows a new search from the header. */}
      <form
        key={q}
        role="search"
        aria-label="Search"
        onSubmit={submit}
        className="flex flex-wrap items-center gap-3"
      >
        <input
          type="search"
          name="q"
          aria-label="Search owners, pets and vets"
          defaultValue={q}
          className={`${INPUT} min-w-48 flex-1`}
        />
        <button type="submit" className={PRIMARY_BUTTON}>
          Search
        </button>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={includeArchived || search.archived}
            // "archived" in the text lists only archived records.
            disabled={search.archived}
            onChange={(event) => setSearch(q, event.target.checked)}
          />
          Include archived
        </label>
      </form>

      {!search.searchable ? (
        <p className="text-sm text-slate-500">
          Type at least 2 characters, or "archived", "owners", "pets" or "vets" to list them.
        </p>
      ) : error ? (
        <ErrorMessage error={error} prefix="Couldn't search" />
      ) : loading || !data ? (
        <p className="text-sm text-slate-500">Searching…</p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-slate-500">
          {asksForArchivedVets(search) ? "Vets aren't archived." : 'No matches.'}
        </p>
      ) : (
        groups.map(({ label, results }) => (
          <div key={label} className="space-y-3">
            <h2 className="text-lg font-semibold">
              {label} <span className="text-sm font-normal text-slate-500">({results.length})</span>
            </h2>
            <ul
              aria-label={label}
              className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white"
            >
              {results.map((result) => (
                <li key={result.key}>
                  <Link to={result.href} className="block px-4 py-3 text-sm hover:bg-slate-50">
                    <ResultLabel result={result} />
                  </Link>
                </li>
              ))}
            </ul>
            {results.length === LIMIT && (
              <p className="text-xs text-slate-500">
                Showing the first {LIMIT}. Add more words to narrow the search.
              </p>
            )}
          </div>
        ))
      )}
    </section>
  );
};

export default SearchPage;
