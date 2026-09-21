export interface CompanyCalendarUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface CompanyCalendarPeoplePage {
  users: CompanyCalendarUser[];
  nextCursor: string | null;
}

export type CompanyCalendarDayPart = "FULL_DAY" | "HALF_DAY";

/**
 * One continuous mark on one person's row — a public holiday over the days it covers.
 *
 * A span, not one entry per day. `startDate`/`endDate` are **observed** and already clipped to the
 * requested window; `nominalDate` carries the legal date when the day was moved, and is null when it
 * was not.
 */
export interface CompanyCalendarMark {
  userId: string;
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  nominalDate: string | null;
  dayPart: CompanyCalendarDayPart;
  calendarId: string;
  calendarName: string | null;
}

/**
 * The one dimension the board's rows can be grouped by — one at a time, never nested. Each is a
 * registry field (`sys:department`, `sys:team`, `sys:office`), and grouping by it needs the same
 * company-wide read grant that filtering by it does.
 */
export type CompanyCalendarGrouping = "DEPARTMENT" | "TEAM" | "OFFICE";

/**
 * One group header. `id` and `name` are null for the "no value" group — the people with no
 * department, team or office — which the backend always sends last.
 *
 * `count` is the rows under this header for the current search and filters, within the reader's
 * scope. A person in two teams is a row under each, and counted in each.
 */
export interface CompanyCalendarGroup {
  id: string | null;
  name: string | null;
  count: number;
}
