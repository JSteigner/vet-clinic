import { useQuery } from '@apollo/client/react';
import { type KeyboardEvent, useId, useState } from 'react';
import { useNavigate } from 'react-router';

import ErrorMessage from '../../components/ErrorMessage';
import { INPUT } from '../../components/styles';
import { SEARCH } from './queries';
import ResultLabel from './ResultLabel';
import { asksForArchivedVets, groupResults, parseSearch, useDebouncedValue } from './search';

const DEBOUNCE_MS = 500;
const LIMIT = 5;

/**
 * The header search: a combobox that searches owners, pets and vets once
 * typing pauses, and lists up to 5 of each. ↑/↓ highlight a result, Enter
 * opens it (or the results page when none is highlighted), Escape closes.
 * "Include archived" adds archived owners and pets to the results.
 */
const SearchBox = () => {
  const navigate = useNavigate();
  const id = useId();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [includeArchived, setIncludeArchived] = useState(false);

  const debounced = useDebouncedValue(text, DEBOUNCE_MS);
  const search = parseSearch(debounced);
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

  const searchable = parseSearch(text).searchable;
  const showing = open && searchable;
  const settled = text === debounced && !loading;
  const groups = settled && data ? groupResults(data.search) : [];
  const seeAll = `/search?q=${encodeURIComponent(text.trim())}${includeArchived ? '&archived=1' : ''}`;
  const options = [
    ...groups.flatMap(({ results }) => results),
    { key: 'see-all', href: seeAll },
  ].map(({ key, href }, index) => ({ key, href, id: `${id}-option-${index}`, index }));
  const option = (key: string) => options.find((candidate) => candidate.key === key)!;
  const seeAllOption = options[options.length - 1];

  const go = (href: string) => {
    setText('');
    setOpen(false);
    setActive(-1);
    navigate(href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (!searchable) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index <= 0 ? options.length - 1 : index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(options[active]?.href ?? seeAll);
    }
  };

  const optionClass = (index: number) =>
    `cursor-pointer px-3 py-2 ${active === index ? 'bg-teal-50' : ''}`;

  return (
    <div role="search" className="flex items-center gap-3">
      <div className="relative min-w-0 flex-1">
        <input
          type="search"
          role="combobox"
          aria-label="Search owners, pets and vets"
          aria-expanded={showing}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={showing && active >= 0 ? options[active]?.id : undefined}
          placeholder="Search…"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className={INPUT}
        />

        {showing && (
          <div
            id={`${id}-listbox`}
            role="listbox"
            aria-label="Search results"
            // Keeps focus in the input, so a click on an option isn't lost to the blur closing the list.
            onMouseDown={(event) => event.preventDefault()}
            className="absolute inset-x-0 top-full z-10 mt-1 max-h-[70vh] overflow-y-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg"
          >
            {!settled ? (
              <p className="px-3 py-2 text-slate-500">Searching…</p>
            ) : error ? (
              <div className="px-3 py-2">
                <ErrorMessage error={error} prefix="Couldn't search" />
              </div>
            ) : asksForArchivedVets(search) && groups.length === 0 ? (
              <p className="px-3 py-2 text-slate-500">Vets aren't archived.</p>
            ) : (
              groups.length === 0 && <p className="px-3 py-2 text-slate-500">No matches.</p>
            )}

            {groups.map(({ label, results }) => (
              <div key={label} role="group" aria-labelledby={`${id}-${label}`}>
                <p
                  id={`${id}-${label}`}
                  className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-500 uppercase"
                >
                  {label}
                </p>
                {results.map((result) => {
                  const { id: optionId, index } = option(result.key);

                  return (
                    <div
                      key={result.key}
                      id={optionId}
                      role="option"
                      aria-selected={active === index}
                      onClick={() => go(result.href)}
                      onMouseEnter={() => setActive(index)}
                      className={optionClass(index)}
                    >
                      <ResultLabel result={result} />
                    </div>
                  );
                })}
              </div>
            ))}

            <div
              id={seeAllOption.id}
              role="option"
              aria-selected={active === seeAllOption.index}
              onClick={() => go(seeAll)}
              onMouseEnter={() => setActive(seeAllOption.index)}
              className={`mt-1 border-t border-slate-100 text-teal-700 ${optionClass(seeAllOption.index)}`}
            >
              See all results for “{text.trim()}”
            </div>
          </div>
        )}
      </div>

      <label
        // Keeps focus in the search box, so the list stays open and refreshes.
        onMouseDown={(event) => event.preventDefault()}
        className="flex items-center gap-2 text-sm whitespace-nowrap text-slate-600"
      >
        <input
          type="checkbox"
          checked={includeArchived}
          onChange={(event) => {
            setIncludeArchived(event.target.checked);
            setActive(-1);
          }}
        />
        Include archived
      </label>
    </div>
  );
};

export default SearchBox;
