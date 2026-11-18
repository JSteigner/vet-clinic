import type { SearchResult } from './search';

/** A search result's name, an Archived badge if it is, and its details. */
const ResultLabel = ({ result: { name, detail, archived } }: { result: SearchResult }) => (
  <>
    <span className="font-medium">{name}</span>
    {archived && (
      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
        Archived
      </span>
    )}
    <span className="block truncate text-xs text-slate-500">{detail}</span>
  </>
);

export default ResultLabel;
