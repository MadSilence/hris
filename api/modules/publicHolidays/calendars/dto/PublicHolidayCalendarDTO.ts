import { PublicHolidayCalendarStatus } from "@/api/modules/publicHolidays/calendars/dto/PublicHolidayCalendarStatus";
import { PublicHolidayCalendarSourceType } from "@/api/modules/publicHolidays/calendars/dto/PublicHolidayCalendarSourceType";

export interface PublicHolidayCalendarDTO {
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
