import { hrisApiPublicHolidaysClient } from "@/api/modules/publicHolidays/holidays/clients";
import type {
  PublicHolidayOverrideRevertResultDTO,
  ReplaceYearHolidaysRequest,
} from "@/api/modules/publicHolidays/holidays/dto";
import { PublicHoliday, PublicHolidayOverride } from "@/models/publicHolidays/holiday";

/**
 * Holiday days are read as a list and written a whole year at a time. There is deliberately no per-day
 * create/update/rename/delete: the year editor saves everything in one request, and the old path of
 * N sequential requests was removed.
 *
 * Overrides — the company's edits of the provider's days — are read beside the days and taken back one
 * at a time ("Revert to Provider"); they are made by saving the year, never here.
 */
export class HrisPublicHolidaysService {
  public async list(calendarId: string, year?: number): Promise<PublicHoliday[]> {
    return hrisApiPublicHolidaysClient.list(calendarId, year);
  }

  public async replaceYear(
    calendarId: string,
    year: number,
    body: ReplaceYearHolidaysRequest
  ): Promise<PublicHoliday[]> {
    return hrisApiPublicHolidaysClient.replaceYear(calendarId, year, body);
  }

  public async listOverrides(calendarId: string, year?: number): Promise<PublicHolidayOverride[]> {
    return hrisApiPublicHolidaysClient.listOverrides(calendarId, year);
  }

  public async revertOverride(overrideId: string): Promise<PublicHolidayOverrideRevertResultDTO> {
    return hrisApiPublicHolidaysClient.revertOverride(overrideId);
  }
}

export const hrisPublicHolidaysService = new HrisPublicHolidaysService();
