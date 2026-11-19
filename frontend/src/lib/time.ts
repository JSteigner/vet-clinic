import { useQuery } from '@apollo/client/react';
import { TZDate, tz } from '@date-fns/tz';
import { addDays, format, parseISO } from 'date-fns';

import { graphql } from '../gql';

// Times are stored in UTC; the clinic works in its own zone, which the API
// exposes so the UI shows and enters times the way the clinic sees them.

export const CLINIC_TIME_ZONE = graphql(`
  query ClinicTimeZone {
    clinicTimeZone
  }
`);

/** The clinic's IANA time zone, or undefined while it loads. */
export const useClinicTimeZone = (): string | undefined => {
  const { data } = useQuery(CLINIC_TIME_ZONE);

  return data?.clinicTimeZone;
};

/** Formats a UTC ISO timestamp in `zone`, e.g. "2:30 PM". */
export const formatInZone = (iso: string, zone: string, pattern = 'h:mm a'): string =>
  format(new Date(iso), pattern, { in: tz(zone) });

/** Today's date in `zone` as YYYY-MM-DD, the API's Date format. */
export const todayInZone = (zone: string, now: Date = new Date()): string =>
  format(now, 'yyyy-MM-dd', { in: tz(zone) });

/** A YYYY-MM-DD date moved by `days` calendar days. */
export const shiftDate = (date: string, days: number): string =>
  format(addDays(parseISO(date), days), 'yyyy-MM-dd');

/** A YYYY-MM-DD date as a heading, e.g. "Thursday, November 12, 2026". */
export const formatDate = (date: string): string => format(parseISO(date), 'EEEE, MMMM d, yyyy');

/** A UTC ISO timestamp as a `datetime-local` input value in `zone`. */
export const toWallTime = (iso: string, zone: string): string =>
  format(new Date(iso), "yyyy-MM-dd'T'HH:mm", { in: tz(zone) });

const QUARTER_HOUR_MS = 15 * 60 * 1000;

/**
 * The next quarter hour after `now` as a `datetime-local` value in `zone`,
 * e.g. 2:07 PM gives 2:15 PM and 2:15 PM gives 2:30 PM. Time zones are offset
 * from UTC by whole quarter hours, so rounding the instant rounds the clock.
 */
export const nextQuarterHour = (zone: string, now: Date = new Date()): string => {
  const next = (Math.floor(now.getTime() / QUARTER_HOUR_MS) + 1) * QUARTER_HOUR_MS;

  return toWallTime(new Date(next).toISOString(), zone);
};

/** A `datetime-local` value (YYYY-MM-DDTHH:mm) in `zone` as a UTC ISO timestamp. */
export const fromWallTime = (wallTime: string, zone: string): string => {
  const [date, time] = wallTime.split('T');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const local = new TZDate(year, month - 1, day, hour, minute, zone);

  return new Date(local.getTime()).toISOString();
};
