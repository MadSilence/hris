/** One change Apply did not write, and why: `EDITED_SINCE`, `ALREADY_PRESENT` or `OVERLAPS:<day name>`. */
export type PublicHolidayDriftSkipped = {
  name: string | null;
  reason: string;
};

/**
 * What applying a provider's holiday changes did — `POST /public-holiday-drifts/{id}/apply`.
 * `requestsLeftUnchanged` counts leave the new holidays would price at nothing: left for a person.
 */
export type PublicHolidayDriftApplyResult = {
  driftId: string;
  calendarId: string;
  year: number;
  applied: number;
  skipped: PublicHolidayDriftSkipped[];
  recalculatedRequests: number;
  requestsLeftUnchanged: number;
};
