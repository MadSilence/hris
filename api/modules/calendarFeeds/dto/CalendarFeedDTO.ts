export enum CalendarFeedKind {
  Calendar = "CALENDAR",
  User = "USER",
  Team = "TEAM",
}

export type CalendarFeedDTO = {
  id: string;
  kind: CalendarFeedKind;
  calendarId: string | null;
  /** Relative to the API host; the absolute URL is assembled where it is shown. */
  path: string;
  lastUsedAt: string | null;
};
