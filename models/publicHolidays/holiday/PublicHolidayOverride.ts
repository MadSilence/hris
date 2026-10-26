import type { PublicHolidayType } from "@/api/modules/publicHolidays/holidays/dto";

/**
 * The company's override of one of its provider's days. The company's version is the day itself
 * (`holidayId`; null when the company removed the day), the provider's version is kept here beside it.
 */
export interface PublicHolidayOverride {
  id: string;
  calendarId: string;
  calendarYear: number;
  holidayId: string | null;
  sourceEventId: string;
  /** False when the provider no longer lists the day and the company kept it. */
  providerPresent: boolean;
  providerName: string | null;
  providerHolidayDate: string | null;
  providerEndDate: string | null;
  providerType: PublicHolidayType | null;
}
