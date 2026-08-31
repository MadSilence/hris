import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  PublicHolidayDTO,
  ReplaceYearHolidaysRequest,
} from "@/api/modules/publicHolidays/holidays/dto";
import { publicHolidayMapper } from "@/api/modules/publicHolidays/holidays/mappers";
import { PublicHoliday } from "@/models/publicHolidays/holiday";

export class HrisApiPublicHolidaysClient {
  public async list(calendarId: string, year?: number): Promise<PublicHoliday[]> {
    const query = year ? `?year=${year}` : "";

    const dtos = await hrisApiClient.get<PublicHolidayDTO[]>(
      `/public-holiday-calendars/${calendarId}/holidays${query}`
    );

    return publicHolidayMapper.mapPublicHolidayDTOs(dtos);
  }

  /** Writes a whole year in one call — the server diffs it against what is stored. */
  public async replaceYear(
    calendarId: string,
    year: number,
    body: ReplaceYearHolidaysRequest
  ): Promise<PublicHoliday[]> {
    const dtos = await hrisApiClient.put<PublicHolidayDTO[], ReplaceYearHolidaysRequest>(
      `/public-holiday-calendars/${calendarId}/years/${year}/holidays`,
      body
    );

    return publicHolidayMapper.mapPublicHolidayDTOs(dtos);
  }
}

export const hrisApiPublicHolidaysClient =
  new HrisApiPublicHolidaysClient();
