import { PublicHolidayType } from "@/api/modules/publicHolidays/holidays/dto/PublicHolidayType";

/**
 * The company's override of one provider day — `GET /public-holiday-calendars/{id}/overrides`. The
 * company's version is the day itself (`holidayId`, null when the company removed it); this carries the
 * provider's version beside it, which "Revert to Provider" writes back.
 */
export interface PublicHolidayOverrideDTO {
  id: string;
  calendarId: string;
  calendarYear: number;
  /** Null when the company removed the provider's day. */
  holidayId: string | null;
  sourceEventId: string;
  /** False when the provider no longer lists the day; the provider fields are then null. */
  providerPresent: boolean;
  providerName: string | null;
  providerHolidayDate: string | null;
  providerEndDate: string | null;
  providerType: PublicHolidayType | null;
}

/** What "Revert to Provider" did — `POST /public-holiday-overrides/{id}/revert`. */
export interface PublicHolidayOverrideRevertResultDTO {
  calendarId: string;
  year: number;
  recalculatedRequests: number;
  requestsLeftUnchanged: number;
}
