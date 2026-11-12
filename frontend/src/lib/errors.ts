import { CombinedGraphQLErrors } from '@apollo/client';

/** A readable message for an Apollo error, e.g. "appointment not found". */
export const errorMessage = (error: unknown): string => {
  if (CombinedGraphQLErrors.is(error)) return error.errors.map(({ message }) => message).join('; ');
  if (error instanceof Error) return error.message;

  return 'Something went wrong';
};
