import { PublicHolidayCalendarStatus } from "@/api/modules/publicHolidays/calendars/dto/PublicHolidayCalendarStatus";
import { PublicHolidayCalendarSourceType } from "@/api/modules/publicHolidays/calendars/dto/PublicHolidayCalendarSourceType";
import {
  PublicHolidayCalendarWeekendSubstitution
} from "@/api/modules/publicHolidays/calendars/dto/PublicHolidayCalendarWeekendSubstitution";

export interface PublicHolidayCalendarDTO {
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
  /** Years this calendar holds days for, newest first. */
  years: number[];
  /** Sent back by the editor on save; a stale one is refused with E00409. */
  version?: number;
}
