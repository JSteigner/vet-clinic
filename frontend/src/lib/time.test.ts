import { describe, expect, test } from 'vitest';

import { formatDate, formatInZone, fromWallTime, shiftDate, todayInZone, toWallTime } from './time';

const CHICAGO = 'America/Chicago';

describe('time helpers', () => {
  test('formatInZone shows a UTC time in the clinic zone', () => {
    expect(formatInZone('2026-11-12T15:30:00Z', CHICAGO)).toBe('9:30 AM');
  });

  test('todayInZone uses the clinic date, not the UTC date', () => {
    // 03:00 UTC on the 12th is still the evening of the 11th in Chicago.
    expect(todayInZone(CHICAGO, new Date('2026-11-12T03:00:00Z'))).toBe('2026-11-11');
  });

  test('shiftDate moves by calendar days across months', () => {
    expect(shiftDate('2026-11-30', 1)).toBe('2026-12-01');
    expect(shiftDate('2026-03-01', -1)).toBe('2026-02-28');
  });

  test('formatDate spells out the day', () => {
    expect(formatDate('2026-11-12')).toBe('Thursday, November 12, 2026');
  });

  test('toWallTime and fromWallTime round-trip through the clinic zone', () => {
    expect(toWallTime('2026-11-12T15:30:00Z', CHICAGO)).toBe('2026-11-12T09:30');
    expect(fromWallTime('2026-11-12T09:30', CHICAGO)).toBe('2026-11-12T15:30:00.000Z');
  });

  test('fromWallTime applies daylight saving time', () => {
    // July is CDT (UTC-5), November is CST (UTC-6).
    expect(fromWallTime('2026-07-01T09:00', CHICAGO)).toBe('2026-07-01T14:00:00.000Z');
  });
});
