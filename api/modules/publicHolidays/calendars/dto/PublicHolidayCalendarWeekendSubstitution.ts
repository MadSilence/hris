/** What a calendar does with a day that lands on a non-working day of the company's week. */
export enum PublicHolidayCalendarWeekendSubstitution {
  None = "NONE",
  NextWorkingDay = "NEXT_WORKING_DAY",
  PreviousWorkingDay = "PREVIOUS_WORKING_DAY",
  NearestWorkingDay = "NEAREST_WORKING_DAY",
  ManualCompensation = "MANUAL_COMPENSATION",
}
