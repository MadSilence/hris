import type { DraftHoliday } from "./PublicHolidayDaysEditor";

/**
 * Finds days that cover the same date, so the editor can say so before the save is attempted.
 *
 * Worth doing on the client even though the backend rejects overlaps too: the year is saved as one
 * transaction, so a rejection throws away every edit made in the session. Catching it here keeps the
 * work.
 *
 * Two things this is careful about. An overlap is not the same as a duplicate start date — a span of
 * 10–14 August and a single day on the 12th start on different days and still collide. And touching
 * is not overlapping: 10–14 followed by the 15th is two holidays back to back, which is ordinary.
 *
 * What it cannot see is the neighbouring year: the editor only holds the year on screen, while a New
 * Year span belongs to the year it starts in and reaches into the next one. That collision is caught
 * by the backend, which answers with the row it hit.
 */
export function findDraftOverlaps(holidays: DraftHoliday[]): Record<string, string> {
  const errors: Record<string, string> = {};

  const spans = holidays
    .filter((h) => h.holidayDate)
    .map((h) => ({
      localId: h.localId,
      name: h.name.trim() || "another day",
      start: h.holidayDate,
      // An empty end means "same day" — comparing "" against a date would quietly always be true.
      end: h.endDate && h.endDate >= h.holidayDate ? h.endDate : h.holidayDate,
    }))
    .sort((a, b) => (a.start === b.start ? a.end.localeCompare(b.end) : a.start.localeCompare(b.start)));

  if (spans.length < 2) return errors;

  let holder = spans[0];

  for (const span of spans.slice(1)) {
    if (span.start <= holder.end) {
      errors[span.localId] = `Overlaps “${holder.name}” (${formatRange(holder.start, holder.end)}).`;
    }
    // Keep whichever span reaches furthest: a long one can collide with several that follow it.
    if (span.end > holder.end) holder = span;
  }

  return errors;
}

function formatRange(start: string, end: string): string {
  return start === end ? start : `${start} → ${end}`;
}
