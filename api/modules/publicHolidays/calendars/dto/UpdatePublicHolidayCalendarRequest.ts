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
}
