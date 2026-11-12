import { CombinedGraphQLErrors } from '@apollo/client';
import { describe, expect, test } from 'vitest';

import { errorMessage } from './errors';

describe('errorMessage', () => {
  test('joins GraphQL error messages', () => {
    const error = new CombinedGraphQLErrors({
      errors: [{ message: 'startsAt must be in the future' }, { message: 'reason is required' }],
    });

    expect(errorMessage(error)).toBe('startsAt must be in the future; reason is required');
  });

  test('uses the message of other errors', () => {
    expect(errorMessage(new Error('Failed to fetch'))).toBe('Failed to fetch');
  });

  test('falls back for non-errors', () => {
    expect(errorMessage('nope')).toBe('Something went wrong');
  });
});
