import { isoToDate } from "@/lib/date";

/** `yyyy-MM` shifted by whole months — plain arithmetic, no `Date`, so no timezone can move it. */
export const shiftMonth = (month: string, delta: number): string => {
  const [year, monthNumber] = month.split("-").map(Number);
  const index = year * 12 + (monthNumber - 1) + delta;
  const nextYear = Math.floor(index / 12);
  const nextMonth = (index % 12) + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
};

/** "September 2026". */
export const formatMonthLabel = (month: string): string => {
  const date = isoToDate(`${month}-01`);
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date);
};

/** "Tue 1" — the weekday and the day of the month, which is what a timesheet row is read by. */
export const formatDayLabel = (iso: string): string => {
  const date = isoToDate(iso);
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
  return `${weekday} ${date.getDate()}`;
};

/**
 * Hours as a person reads them: "7.5", "8", "0.25". A missing value is an empty string, never a dash
 * (`technical_documentation/ui/FORMS_AND_FIELDS.md` § 4).
 */
export const formatHours = (hours: number | null | undefined): string => {
  if (hours === null || hours === undefined) return "";
  return String(Number(hours.toFixed(2)));
};

/**
 * What a person typed into an hours field, as a number — or `null` when it is not one.
 *
 * Accepts a comma as the decimal separator, because half of Europe types one. Range and precision
 * are the backend's to refuse; this only turns text into a number.
 */
export const parseHours = (raw: string): number | null => {
  const text = raw.trim().replace(",", ".");
  if (text === "") return null;
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  return Number(text);
};
