import { dateToISO, isoToDate, partsToISO } from "@/lib/date";

/**
 * Day arithmetic the time off screens share (profile-time-off, 2026-11-19): the month grid's cells, the day a person
 * is back, and how many months a request's days need on screen. Local dates only, as `lib/date` writes them.
 */

export type DayRange = { start: string; end: string };

export type MonthCell = {
  iso: string;
  day: number;
  inMonth: boolean;
  /** `Date.getDay()` of the cell. */
  weekday: number;
};

/** How far a weekday sits from the company's first day of the week. */
const offsetOf = (jsDay: number, weekStartsOn: number) => (jsDay - weekStartsOn + 7) % 7;

/**
 * A month as week rows of seven, from the company's first weekday: the leading and trailing days of the neighbours
 * included (`inMonth` false). As many rows as the month touches — four to six.
 */
export const monthWeeks = (year: number, month: number, weekStartsOn: number): MonthCell[][] => {
  const lead = offsetOf(new Date(year, month, 1).getDay(), weekStartsOn);
  const days = new Date(year, month + 1, 0).getDate();
  const rows = Math.ceil((lead + days) / 7);
  const cells = Array.from({ length: rows * 7 }, (_, i) => {
    const d = new Date(year, month, i - lead + 1);
    return {
      iso: partsToISO(d.getFullYear(), d.getMonth(), d.getDate()),
      day: d.getDate(),
      inMonth: d.getMonth() === month,
      weekday: d.getDay(),
    };
  });
  return Array.from({ length: rows }, (_, w) => cells.slice(w * 7, w * 7 + 7));
};

/** Whether an ISO day falls inside a range, ends included. */
export const inRange = (iso: string, range: DayRange | null | undefined) =>
  Boolean(range && iso >= range.start && iso <= range.end);

/**
 * The first day after `endISO` that is a working day and not a holiday — "Back Mon 7 Dec". Gives up after a year,
 * which only a company with no working days at all would reach.
 */
export const backOn = (
  endISO: string,
  isNonWorking: (d: Date) => boolean,
  holidays: ReadonlySet<string> = new Set(),
): string => {
  const d = isoToDate(endISO);
  for (let i = 0; i < 366; i++) {
    d.setDate(d.getDate() + 1);
    if (!isNonWorking(d) && !holidays.has(dateToISO(d))) return dateToISO(d);
  }
  return dateToISO(d);
};

/** Every month a range touches, as `{ year, month }`, in order. */
export const monthsOf = (range: DayRange): { year: number; month: number }[] => {
  const a = isoToDate(range.start);
  const b = isoToDate(range.end);
  const out: { year: number; month: number }[] = [];
  for (let y = a.getFullYear(), m = a.getMonth(); y < b.getFullYear() || (y === b.getFullYear() && m <= b.getMonth()); ) {
    out.push({ year: y, month: m });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out;
};

/**
 * How a request's days are drawn when it is opened in full (Q30, Q30d, Q30f): **one** month when the range fits the
 * first month's grid — its trailing days of the next month included; **two** months side by side when it runs into
 * the next; **many** small months in a row beyond that.
 */
export const monthsLayout = (range: DayRange, weekStartsOn: number): "one" | "two" | "many" => {
  const a = isoToDate(range.start);
  const weeks = monthWeeks(a.getFullYear(), a.getMonth(), weekStartsOn);
  const lastShown = weeks[weeks.length - 1][6].iso;
  if (range.end <= lastShown) return "one";
  return monthsOf(range).length <= 2 ? "two" : "many";
};
