import { displayLocale, formatDisplayDate } from "@/lib/date";

/**
 * A moment from the backend. Its `LocalDateTime` fields are UTC wall-clock with no zone suffix
 * (`hris-api/CLAUDE.md` § "Time and dates"), which `new Date` would read as local time. `language` is the
 * page's (`useDisplayLanguage()`) — pass it during render.
 */
export const formatMoment = (value: string | null | undefined, language?: string): string => {
  if (!value) return "";
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;
  const time = new Intl.DateTimeFormat(displayLocale(language), { hour: "2-digit", minute: "2-digit" }).format(date);
  return `${formatDisplayDate(date, { style: "medium", language })}, ${time}`;
};
