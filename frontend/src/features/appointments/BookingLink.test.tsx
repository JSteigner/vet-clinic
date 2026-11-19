import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { renderWithProviders } from '../../test/render';
import BookingLink from './BookingLink';
import { bookingHref } from './bookingHref';

describe('bookingHref', () => {
  test("fills in the owner, pet or vet whose page it's on", () => {
    expect(bookingHref('/owners/20', '')).toBe('/appointments/new?ownerId=20');
    expect(bookingHref('/pets/10', '')).toBe('/appointments/new?petId=10');
    expect(bookingHref('/vets/30', '')).toBe('/appointments/new?vetId=30');
  });

  test("fills in the day shown on the schedule or a vet's page", () => {
    expect(bookingHref('/', '?date=2026-11-20')).toBe('/appointments/new?date=2026-11-20');
    expect(bookingHref('/vets/30', '?date=2026-11-20')).toBe(
      '/appointments/new?vetId=30&date=2026-11-20',
    );
  });

  test('fills in nothing elsewhere', () => {
    expect(bookingHref('/', '')).toBe('/appointments/new');
    expect(bookingHref('/owners', '')).toBe('/appointments/new');
    expect(bookingHref('/search', '?q=rex&date=2026-11-20')).toBe('/appointments/new');
  });
});

describe('BookingLink', () => {
  test('links to the booking form for the current page', () => {
    renderWithProviders(<BookingLink />, { route: '/owners/20' });

    expect(screen.getByRole('link', { name: 'Book appointment' })).toHaveAttribute(
      'href',
      '/appointments/new?ownerId=20',
    );
  });
});
