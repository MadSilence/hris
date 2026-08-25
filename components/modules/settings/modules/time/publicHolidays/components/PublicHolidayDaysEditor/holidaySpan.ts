import type { DraftHoliday } from "./PublicHolidayDaysEditor";

/** Inclusive length of a span in days; a missing or backwards end is a single day. */
export function holidaySpanDays(start: string, end: string): number {
  const from = Date.parse(`${start}T00:00:00`);
  const to = Date.parse(`${end}T00:00:00`);
  if (Number.isNaN(from) || Number.isNaN(to) || to < from) return 1;
  return Math.floor((to - from) / 86_400_000) + 1;
}

/**
 * Days off, not rows. Since providers hand us multi-day holidays as one span, a row and a day
 * stopped being the same thing — "5 days added" for Eid Al-Adha is the honest count, "1" is not.
 */
export function totalDraftDays(holidays: DraftHoliday[]): number {
  return holidays.reduce(
    (total, holiday) =>
      total + (holiday.holidayDate ? holidaySpanDays(holiday.holidayDate, holiday.endDate || holiday.holidayDate) : 0),
    0,
  );
}
