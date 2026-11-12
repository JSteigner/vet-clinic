import { errorMessage } from '../lib/errors';

/** An inline alert for a failed query or mutation. */
const ErrorMessage = ({ error, prefix }: { error: unknown; prefix?: string }) => (
  <p role="alert" className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
    {prefix && `${prefix}: `}
    {errorMessage(error)}
  </p>
);

export default ErrorMessage;
