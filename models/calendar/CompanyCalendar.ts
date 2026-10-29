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
 * One person's leave on the board, clipped to the window. **A field that is missing is a field the reader
 * may not have** — the server leaves it out (the disclosure rule, `COMPANY_CALENDAR.md` § 6):
 * no `leaveTypeName` means the bar says "Time off" in a neutral tone; no `requestId` means it is not a link.
 * `status` is `PENDING` / `CANCELLATION_PENDING` only for a reader who may see a request still being decided.
 */
export interface CompanyCalendarAbsence {
  userId: string;
  startDate: string;
  endDate: string;
  status: "APPROVED" | "PENDING" | "CANCELLATION_PENDING";
  leaveTypeName?: string;
  leaveTypeColor?: string;
  requestId?: string;
  /** The request's current step can be signed by the reader. */
  awaitingYou?: boolean;
}

/**
 * A day on which a group — or, ungrouped, the company — is at its limit of people away: the next request
 * for that day would be refused (`BLOCK`) or warned (`WARN`). `away` and `cap` come only to a reader whose
 * scope covers the whole group; without them the mark says a limit is reached, never who reached it.
 */
export interface CompanyCalendarCapacity {
  groupId?: string;
  date: string;
  behavior: "BLOCK" | "WARN";
  away?: number;
  cap?: number;
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
