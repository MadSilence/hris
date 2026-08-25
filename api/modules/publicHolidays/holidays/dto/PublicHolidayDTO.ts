import { PublicHolidayOrigin } from "@/api/modules/publicHolidays/holidays/dto/PublicHolidayOrigin";
import { PublicHolidayDayPart } from "@/api/modules/publicHolidays/holidays/dto/PublicHolidayDayPart";
import { PublicHolidayType } from "@/api/modules/publicHolidays/holidays/dto/PublicHolidayType";

export interface PublicHolidayDTO {
  id: string;
  calendarId: string;
  calendarYear: number;
  name: string;
  holidayDate: string;
  endDate: string;
  /** Null when the day is observed on its nominal date. */
  observedDate: string | null;
  origin: PublicHolidayOrigin;
  sourceEventId: string | null;
  dayPart: PublicHolidayDayPart;
  type: PublicHolidayType;
}
