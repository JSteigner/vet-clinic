import type { ReactNode } from 'react';

type Props = {
  label: string;
  /** The id of the input inside, so the label points at it. */
  htmlFor: string;
  error?: string;
  children: ReactNode;
};

/** A labelled form input with its validation error underneath. */
const Field = ({ label, htmlFor, error, children }: Props) => (
  <div className="space-y-1">
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
      {label}
    </label>
    {children}
    {error && <p className="text-sm text-rose-600">{error}</p>}
  </div>
);

export default Field;
