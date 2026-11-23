import type { CompanyCalendarAbsence } from "@/models/calendar";
import { addDays, toISO } from "@/components/modules/calendar/lib/dateRange";
import { daysBetween } from "@/components/modules/calendar/lib/boardGeometry";

/**
 * What a leave pill and the leave card say about one absence — the pure half (N01, N02, N04, N05).
 *
 * The server decides what the reader may know (`COMPANY_CALENDAR.md` § 6): a policy that was not sent is "Away", a
 * length or a comment that was not sent is not said. Nothing here widens that.
 */

/** The request's own dates: the board's bar is cut to the loaded days, the card speaks of the whole request. */
export const requestSpan = (a: CompanyCalendarAbsence): { start: string; end: string } => ({
  start: a.requestStartDate ?? a.startDate,
  end: a.requestEndDate ?? a.endDate,
});

/** The first working day after the leave — "back Mon 23 Nov". Holidays are not skipped: the board says "back", not "at work". */
export const backDay = (endISO: string, isNonWorkingDay: (d: Date) => boolean): string => {
  let day = addDays(new Date(`${endISO}T00:00:00`), 1);
  for (let i = 0; i < 7 && isNonWorkingDay(day); i += 1) day = addDays(day, 1);
  return toISO(day);
};

/** Two weeks or more: the pill says where it ends ("Parental leave · back Mon 4 Jan"), not how long it is. */
export const LONG_LEAVE_DAYS = 14;
export const isLongLeave = (a: CompanyCalendarAbsence): boolean => {
  const { start, end } = requestSpan(a);
  return daysBetween(new Date(`${start}T00:00:00`), new Date(`${end}T00:00:00`)) + 1 >= LONG_LEAVE_DAYS;
};

/** The pill's second part, by what the reader was sent and the scale. */
export type PillSuffix =
  | { kind: "back"; date: string }
  | { kind: "amount"; amount: number; unit: "DAYS" | "HOURS"; working?: boolean }
  | { kind: "dates"; start: string; end: string }
  | { kind: "none" };

export const pillSuffix = (
  a: CompanyCalendarAbsence,
  scale: "month" | "week",
  isNonWorkingDay: (d: Date) => boolean,
): PillSuffix => {
  const { start, end } = requestSpan(a);
  if (isLongLeave(a)) return { kind: "back", date: backDay(end, isNonWorkingDay) };
  if (scale === "week") return { kind: "dates", start, end };
  if (a.amount !== undefined && a.amount !== null) return { kind: "amount", amount: a.amount, unit: a.unit ?? "DAYS", ...(a.countingMode === "WORKING_DAYS" ? { working: true } : {}) };
  return { kind: "none" };
};

/** Somebody else away while a request waits (N05's amber line): who, and the days they overlap it. */
export type AlsoAway = { first: string; others: number; start: string; end: string };

/**
 * The people on the board who are away during `absence`, the reader's own row left out. Only what the board has
 * loaded is known here, and it is the reader's own view of the company — the line never names someone the reader
 * could not already see.
 */
export const alsoAway = (
  absence: CompanyCalendarAbsence,
  everyone: readonly CompanyCalendarAbsence[],
  nameOf: (userId: string) => string | undefined,
): AlsoAway | null => {
  const { start, end } = requestSpan(absence);
  const overlaps = new Map<string, { start: string; end: string }>();
  for (const other of everyone) {
    if (other.userId === absence.userId) continue;
    const span = requestSpan(other);
    if (span.end < start || span.start > end) continue;
    const from = span.start > start ? span.start : start;
    const to = span.end < end ? span.end : end;
    const seen = overlaps.get(other.userId);
    overlaps.set(other.userId, seen ? { start: seen.start < from ? seen.start : from, end: seen.end > to ? seen.end : to } : { start: from, end: to });
  }
  const named = [...overlaps.entries()]
    .map(([userId, span]) => ({ name: nameOf(userId), ...span }))
    .filter((o): o is { name: string; start: string; end: string } => Boolean(o.name))
    .sort((a, b) => a.start.localeCompare(b.start) || a.name.localeCompare(b.name));
  if (named.length === 0) return null;
  return { first: named[0].name, others: named.length - 1, start: named[0].start, end: named[0].end };
};
