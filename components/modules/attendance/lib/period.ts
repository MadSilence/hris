import { isoToDate } from "@/lib/date";
import type { AttendancePeriod } from "@/models/attendance";

/**
 * The window Attendance is read over, and the arithmetic around it. Months are `yyyy-MM`, days
 * `yyyy-MM-dd`, times of day `HH:mm`, durations minutes — plain strings and numbers, no `Date`
 * arithmetic, so no timezone can move a day.
 */

/** `yyyy-MM` shifted by whole months. */
export const shiftMonth = (month: string, delta: number): string => {
  const [year, monthNumber] = month.split("-").map(Number);
  const index = year * 12 + (monthNumber - 1) + delta;
  const nextYear = Math.floor(index / 12);
  const nextMonth = (index % 12) + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
};

/** The month a day is in. */
export const monthOf = (iso: string): string => iso.slice(0, 7);

/** The first and last day of a month. */
export const monthBounds = (month: string): { from: string; to: string } => {
  const [year, monthNumber] = month.split("-").map(Number);
  const last = new Date(year, monthNumber, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, "0")}` };
};

/**
 * The period a month is read as. The current month counts "expected" up to today, a past or future
 * month to its end (the owner, 2026-09-28): on the 10th, 22 expected days against 7 logged reads as a
 * defect that is not there.
 */
export const monthPeriod = (month: string, today: string): AttendancePeriod => {
  const { from, to } = monthBounds(month);
  return { from, to, expectedUntil: monthOf(today) === month ? today : null };
};

/** "September 2026". */
export const formatMonthLabel = (month: string): string => {
  const date = isoToDate(`${month}-01`);
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date);
};

/** "Tue 1" — the weekday and the day of the month. */
export const formatDayLabel = (iso: string): string => {
  const date = isoToDate(iso);
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
  return `${weekday} ${date.getDate()}`;
};

/** `"09:30"` → `570`. Anything that is not `HH:mm` within a day is `null`. */
export const minutesOfDay = (value: string): number | null => {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

/**
 * Minutes between two times of one day. `null` when either end is missing or the span does not run
 * forwards — **a span that ends before it starts is not a night shift**, it is a typo. Crossing
 * midnight needs a second date and is refused by the backend too.
 */
export const spanMinutes = (from: string, to: string): number | null => {
  const start = minutesOfDay(from);
  const end = minutesOfDay(to);
  if (start === null || end === null || end <= start) return null;
  return end - start;
};

/**
 * A duration typed as `H:MM` (`7:30`) or as hours (`7.5`, `7,5`), in minutes — or `null` when it is
 * neither. The schedule editor and the company norm take durations this way.
 */
export const parseDuration = (raw: string): number | null => {
  const text = raw.trim();
  if (text === "") return null;
  const hm = /^(\d{1,2}):([0-5]\d)$/.exec(text);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2]);
  const decimal = text.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(decimal)) return null;
  return Math.round(Number(decimal) * 60);
};
