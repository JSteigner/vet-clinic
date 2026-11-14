import { CombinedGraphQLErrors } from '@apollo/client';
import { describe, expect, test } from 'vitest';

import { errorMessage, fieldErrors, isNotFound } from './errors';

const graphQLErrors = (...errors: { message: string; extensions?: Record<string, unknown> }[]) =>
  new CombinedGraphQLErrors({ errors });

describe('errorMessage', () => {
  test('joins GraphQL error messages', () => {
    const error = graphQLErrors(
      { message: 'startsAt must be in the future' },
      { message: 'reason is required' },
    );

    expect(errorMessage(error)).toBe('startsAt must be in the future; reason is required');
  });

  test('uses the message of other errors', () => {
    expect(errorMessage(new Error('Failed to fetch'))).toBe('Failed to fetch');
  });

  test('falls back for non-errors', () => {
    expect(errorMessage('nope')).toBe('Something went wrong');
  });
});

describe('isNotFound', () => {
  test('detects not found errors from the API', () => {
    expect(isNotFound(graphQLErrors({ message: 'appointment not found' }))).toBe(true);
    expect(isNotFound(graphQLErrors({ message: 'reason is required' }))).toBe(false);
    expect(isNotFound(new Error('pet not found'))).toBe(false);
  });
});

describe('fieldErrors', () => {
  test('maps errors to their fields without the field name prefix', () => {
    const error = graphQLErrors(
      { message: 'startsAt must be in the future', extensions: { field: 'startsAt' } },
      { message: "reason can't be blank", extensions: { field: 'reason' } },
    );

    expect(fieldErrors(error)).toEqual({
      startsAt: 'must be in the future',
      reason: "can't be blank",
    });
  });

  test('skips errors without a field', () => {
    expect(fieldErrors(graphQLErrors({ message: 'pet not found' }))).toEqual({});
    expect(fieldErrors(undefined)).toEqual({});
  });
});
