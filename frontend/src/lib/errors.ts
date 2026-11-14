import { CombinedGraphQLErrors } from '@apollo/client';

/** A readable message for an Apollo error, e.g. "appointment not found". */
export const errorMessage = (error: unknown): string => {
  if (CombinedGraphQLErrors.is(error)) return error.errors.map(({ message }) => message).join('; ');
  if (error instanceof Error) return error.message;

  return 'Something went wrong';
};

/** Whether the API reported a missing record ("pet not found", ...). */
export const isNotFound = (error: unknown): boolean =>
  CombinedGraphQLErrors.is(error) &&
  error.errors.some(({ message }) => message.endsWith('not found'));

/**
 * Validation errors by input field. The API sends one error per invalid field,
 * e.g. message "startsAt must be in the future" with extensions.field "startsAt";
 * this returns { startsAt: "must be in the future" } to show under that input.
 */
export const fieldErrors = (error: unknown): Record<string, string> => {
  if (!CombinedGraphQLErrors.is(error)) return {};

  return Object.fromEntries(
    error.errors.flatMap(({ message, extensions }) => {
      const field = extensions?.field;
      if (typeof field !== 'string') return [];

      const text = message.startsWith(`${field} `) ? message.slice(field.length + 1) : message;
      return [[field, text]];
    }),
  );
};
