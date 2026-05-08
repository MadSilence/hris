import { PublicHolidayCalendarSourceType, PublicHolidayCalendarStatus } from "@/api/modules/publicHolidays/calendars/dto";

export interface PublicHolidayCalendar {
  id: string;
  name: string;
  year: number;
  status: PublicHolidayCalendarStatus;
  sourceType: PublicHolidayCalendarSourceType;
  sourceExternalId: string | null;
  sourceCountryCode: string | null;
  sourceRegionCode: string | null;
  sourceLocale: string | null;
  archivedAt: string | null;
  archivedBy: string | null;
}
