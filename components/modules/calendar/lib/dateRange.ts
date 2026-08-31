import { dateToISO } from "@/lib/date";

export { pad, dateToISO as toISO } from "@/lib/date";

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const addMonths = (d: Date, n: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
};

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

export const startOfWeek = (d: Date) => {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
export const endOfWeek = (d: Date) => addDays(startOfWeek(d), 6);

export const eachDay = (from: Date, to: Date): Date[] => {
  const out: Date[] = [];
  let cursor = new Date(from);
  while (cursor <= to) {
    out.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return out;
};

/**
 * The company's working week, resolved once, shared by both calendars.
 *
 * `isWeekend` used to be a hardcoded `getDay() === 0 || === 6`, in two components. The company
 * already configures its working days — that setting exists precisely so a Sunday-to-Thursday week
 * gets the right answer — and the backend's day counting has always used it, so the shading and the
 * arithmetic disagreed for any company that is not Monday-to-Friday.
 */
const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export const DEFAULT_WORKING_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

/**
 * Builds the "is this a day off" test from a working-day list.
 *
 * An empty or missing list falls back to Monday–Friday rather than marking every day non-working:
 * the provider can be mid-flight, and a board shaded end to end would read as a bug, not as missing
 * data.
 */
export const nonWorkingDayTest = (workingDays?: string[]) => {
  const working = new Set(workingDays?.length ? workingDays : DEFAULT_WORKING_DAYS);
  return (d: Date) => !working.has(DAY_NAMES[d.getDay()]);
};

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Every day an inclusive `[start, end]` span covers, as ISO strings.
 *
 * One expander, because there used to be three. A holiday is stored as a span and each consumer that
 * wanted to mark days walked it for itself — the company board in Java, the profile calendar here,
 * the leave calculator in Java again — and the copies drifted: the board's walked **nominal** dates
 * while the other two walked observed ones, which is how `/calendar` came to draw a substituted
 * holiday on the day nobody is off. The board now draws spans directly and does not expand at all;
 * this is what is left on the client.
 *
 * Dates are read in local time via `toISO`, never `toISOString()`, so the day never slips a
 * timezone. The inline `${y}-${pad(m)}-${pad(d)}` this replaced was a fourth copy of that rule.
 */
export const expandSpanToDays = (startISO: string, endISO?: string | null): string[] => {
  const end = endISO && endISO >= startISO ? endISO : startISO;
  const cursor = new Date(`${startISO}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) return [startISO];

  const out: string[] = [];
  while (cursor <= last) {
    out.push(dateToISO(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
};
