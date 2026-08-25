/** How far a materialised year has drifted from what its source now reports. */
export type PublicHolidayYearDiff = {
  added: number;
  changed: number;
  removed: number;
};

/**
 * `applied` is the whole story: an empty year gets written, a year that already has days is only
 * inspected — approved leave was costed against those dates.
 */
export type PublicHolidayYearFillResult = {
  calendarId: string;
  year: number;
  applied: boolean;
  daysWritten: number;
  diff: PublicHolidayYearDiff;
};
