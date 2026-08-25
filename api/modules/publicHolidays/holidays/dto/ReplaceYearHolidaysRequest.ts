import { PublicHolidayDayPart } from "@/api/modules/publicHolidays/holidays/dto/PublicHolidayDayPart";
import { PublicHolidayType } from "@/api/modules/publicHolidays/holidays/dto/PublicHolidayType";

/** One day in the payload. `id` is null for a day being added. */
export interface ReplaceYearHolidayItem {
  id: string | null;
  name: string;
  holidayDate: string;
  endDate: string;
  observedDate?: string | null;
  dayPart?: PublicHolidayDayPart;
  type?: PublicHolidayType;
  /** The provider's id, for a day that came from a template preview. */
  sourceEventId?: string | null;
}

/**
 * A whole calendar-year in one request. The server diffs it against what is stored, so the client
 * never has to send a create/update/delete per row.
 */
export interface ReplaceYearHolidaysRequest {
  holidays: ReplaceYearHolidayItem[];
}
