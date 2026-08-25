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
}
