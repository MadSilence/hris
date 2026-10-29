import { partsToISO } from "@/lib/date";

/**
 * The calendar date in a zone, as `yyyy-MM-dd`. Home's "today" is the company's (HOME_AND_SEARCH_DESIGN.md
 * § 7.7), not the browser's: somebody reading at 01:00 in New York for a company in Warsaw is already on
 * Warsaw's tomorrow. The locale below only names the parts; nothing is displayed in it.
 */
export const isoDateInZone = (now: Date, zone: string | null | undefined): string => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(zone ? { timeZone: safeZone(zone) } : {}),
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return partsToISO(part("year"), part("month") - 1, part("day"));
};

/** The hour of the day in a zone, 0–23. */
export const hourInZone = (now: Date, zone: string | null | undefined): number => {
  const hour = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hourCycle: "h23",
    ...(zone ? { timeZone: safeZone(zone) } : {}),
  }).formatToParts(now).find((p) => p.type === "hour")?.value;
  return Number(hour ?? 0);
};

/** A clock reading in a zone, in the reader's own locale. */
export const timeInZone = (now: Date, zone: string | null | undefined): string =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    ...(zone ? { timeZone: safeZone(zone) } : {}),
  }).format(now);

/** The weekday of a calendar date, in the reader's own locale. A calendar date is never moved by a zone. */
export const weekdayOf = (iso: string): string =>
  new Intl.DateTimeFormat(undefined, { weekday: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

export const greetingFor = (hour: number): string =>
  hour < 5 ? "Good evening" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

/** A stored zone that has left the tz database must not break the page. */
const safeZone = (zone: string): string | undefined => {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: zone });
    return zone;
  } catch {
    return undefined;
  }
};
