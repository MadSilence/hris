import { PublicHolidayType } from "@/api/modules/publicHolidays/holidays/dto";

export type PublicHolidayTemplatePreviewItem = {
  sourceEventId: string;
  name: string;
  holidayDate: string;
  /** Inclusive end of the span; equals `holidayDate` for a single day. */
  endDate: string;
  type: PublicHolidayType;
};
