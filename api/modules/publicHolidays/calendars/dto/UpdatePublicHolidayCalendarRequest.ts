import { PublicHolidayCalendarSourceType } from "@/api/modules/publicHolidays/calendars/dto/PublicHolidayCalendarSourceType";
import {
  PublicHolidayCalendarWeekendSubstitution
} from "@/api/modules/publicHolidays/calendars/dto/PublicHolidayCalendarWeekendSubstitution";

export interface UpdatePublicHolidayCalendarRequest {
  name: string;
  sourceType: PublicHolidayCalendarSourceType;
  sourceExternalId: string | null;
  sourceCountryCode: string | null;
  sourceRegionCode: string | null;
  sourceLocale: string | null;
  weekendSubstitution?: PublicHolidayCalendarWeekendSubstitution;
  autoFillEnabled?: boolean;
  /** The calendar's version the editor was opened with; a stale one is refused with E00409. */
  version?: number;
}

/**
 * The PATCH answers the version it produced. The editor saves the fields and then the year, both
 * guarded on the calendar's version, so the year has to carry the version the first write left.
 */
export interface UpdatePublicHolidayCalendarResponse {
  id: string;
  version: number;
}
