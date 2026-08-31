import { hrisApiPublicHolidaysClient } from "@/api/modules/publicHolidays/holidays/clients";
import type { ReplaceYearHolidaysRequest } from "@/api/modules/publicHolidays/holidays/dto";
import { PublicHoliday } from "@/models/publicHolidays/holiday";

/**
 * Дни праздников читаются списком и пишутся целым годом. Поштучных create/update/rename/delete
 * здесь нет намеренно: редактор года сохраняет всё одним запросом (`PUBLIC_HOLIDAYS_DESIGN.md`,
 * фаза 0 шаг 5), а старый путь из N последовательных запросов удалён клинапом 2026-08-25.
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
}

export const hrisPublicHolidaysService = new HrisPublicHolidaysService();
