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

/** A `datetime-local` value (YYYY-MM-DDTHH:mm) in `zone` as a UTC ISO timestamp. */
export const fromWallTime = (wallTime: string, zone: string): string => {
  const [date, time] = wallTime.split('T');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const local = new TZDate(year, month - 1, day, hour, minute, zone);

  return new Date(local.getTime()).toISOString();
};
