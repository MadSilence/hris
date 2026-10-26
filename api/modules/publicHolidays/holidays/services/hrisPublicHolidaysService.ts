import { hrisApiPublicHolidaysClient } from "@/api/modules/publicHolidays/holidays/clients";
import type {
  PublicHolidayOverrideRevertResultDTO,
  ReplaceYearHolidaysRequest,
} from "@/api/modules/publicHolidays/holidays/dto";
import { PublicHoliday, PublicHolidayOverride } from "@/models/publicHolidays/holiday";

/**
 * Дни праздников читаются списком и пишутся целым годом. Поштучных create/update/rename/delete
 * здесь нет намеренно: редактор года сохраняет всё одним запросом (`PUBLIC_HOLIDAYS_DESIGN.md`,
 * фаза 0 шаг 5), а старый путь из N последовательных запросов удалён клинапом 2026-08-25.
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
