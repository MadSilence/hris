import type { CompanyCalendarAbsence } from "./CompanyCalendar";

/**
 * One person's absence today and their next one, for the profile header (R12) —
 * `GET /calendar/company/people/{userId}/absences/current-and-next`. Each is a bar of the board, disclosed by the
 * board's rule: a policy the reader may not see comes with no name and no colour ("Away"). Null when there is none the
 * reader may see — and for a person outside the reader's calendar scope, the same as somebody never away.
 * `requestStartDate` / `requestEndDate` are the request's own dates, unclipped.
 */
export type CompanyCalendarAbsenceSpan = CompanyCalendarAbsence & {
  requestStartDate?: string;
  requestEndDate?: string;
};

export interface CompanyCalendarAbsenceSummary {
  current: CompanyCalendarAbsenceSpan | null;
  next: CompanyCalendarAbsenceSpan | null;
}
