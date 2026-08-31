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
