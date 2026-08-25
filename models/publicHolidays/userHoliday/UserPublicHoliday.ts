import { PublicHolidayDayPart } from "@/api/modules/publicHolidays/holidays/dto";

/** `holidayDate`/`endDate` are the OBSERVED span — the days off, not the legal dates. */
export interface UserPublicHoliday {
  id: string;
  name: string;
  holidayDate: string;
  endDate: string;
  /** The nominal date, when the day was moved off it. Null when it was not. */
  nominalDate: string | null;
  dayPart: PublicHolidayDayPart;
  calendarId: string;
  calendarName: string | null;
}
