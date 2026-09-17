import {
  PublicHolidayCalendarSourceType,
  PublicHolidayCalendarStatus,
  PublicHolidayCalendarWeekendSubstitution,
} from "@/api/modules/publicHolidays/calendars/dto";

/**
 * A holiday calendar is a place — "Poland", "Germany — Bavaria" — not a year. The years it covers
 * live on its days and come back in `years`.
 */
export interface PublicHolidayCalendar {
  id: string;
  name: string;
  status: PublicHolidayCalendarStatus;
  sourceType: PublicHolidayCalendarSourceType;
  sourceExternalId: string | null;
  sourceCountryCode: string | null;
  sourceRegionCode: string | null;
  sourceLocale: string | null;
  weekendSubstitution: PublicHolidayCalendarWeekendSubstitution;
  autoFillEnabled: boolean;
  archivedAt: string | null;
  archivedBy: string | null;
  holidayCount: number;
  /** Newest first. Empty for a calendar nobody has filled yet. */
  years: number[];
  /** Sent back by the editor on save, so a colleague's save in between is refused, not overwritten. */
  version?: number;
}

/** What deleting a calendar takes with it, shown before Delete is pressed. */
export type PublicHolidayCalendarDeleteImpact = {
  name: string;
  /** People who lose the calendar. Leave already approved against it is not recalculated. */
  peopleAssigned: number;
  /** Holiday days deleted with it. */
  holidayDays: number;
  /** Subscription links that stop working. */
  feedLinks: number;
};
