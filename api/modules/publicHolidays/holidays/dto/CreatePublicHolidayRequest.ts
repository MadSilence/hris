import { PublicHolidayDayPart } from "@/api/modules/publicHolidays/holidays/dto/PublicHolidayDayPart";
import { PublicHolidayType } from "@/api/modules/publicHolidays/holidays/dto/PublicHolidayType";

export interface CreatePublicHolidayRequest {
  name: string;
  holidayDate: string;
  endDate: string;
  observedDate?: string | null;
  dayPart?: PublicHolidayDayPart;
  type?: PublicHolidayType;
}
