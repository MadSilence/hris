import {
  PublicHolidayDayPart,
  PublicHolidayOrigin,
  PublicHolidayType,
} from "@/api/modules/publicHolidays/holidays/dto";

export interface PublicHoliday {
  id: string;
  calendarId: string;
  calendarYear: number;
  /** The nominal, legal date. */
  holidayDate: string;
  endDate: string;
  /** The day people are actually off, when it differs. Null when it does not. */
  observedDate: string | null;
  name: string;
  origin: PublicHolidayOrigin;
  sourceEventId: string | null;
  dayPart: PublicHolidayDayPart;
  type: PublicHolidayType;
}
