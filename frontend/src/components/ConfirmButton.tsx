import { useState } from 'react';

type Props = {
  label: string;
  /** The question shown after the first click, e.g. "Cancel this visit?" */
  question: string;
  onConfirm: () => void;
  disabled?: boolean;
};

/** A button for actions that can't be undone: the first click asks to confirm. */
const ConfirmButton = ({ label, question, onConfirm, disabled = false }: Props) => {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setAsking(true)}
        className="rounded-md px-2.5 py-1 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
      >
        {label}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="text-slate-600">{question}</span>
      <button
        type="button"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        className="rounded-md bg-rose-600 px-2.5 py-1 font-medium text-white hover:bg-rose-700"
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className="rounded-md px-2.5 py-1 font-medium text-slate-600 hover:bg-slate-100"
      >
        No
      </button>
    </span>
  );
};

export default ConfirmButton;
