import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  PublicHolidayDTO,
  PublicHolidayOverrideDTO,
  PublicHolidayOverrideRevertResultDTO,
  ReplaceYearHolidaysRequest,
} from "@/api/modules/publicHolidays/holidays/dto";
import { publicHolidayMapper } from "@/api/modules/publicHolidays/holidays/mappers";
import { PublicHoliday, PublicHolidayOverride } from "@/models/publicHolidays/holiday";

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

  /** The company's overrides of the provider's days — of one year, or of all of them. */
  public async listOverrides(calendarId: string, year?: number): Promise<PublicHolidayOverride[]> {
    const query = year ? `?year=${year}` : "";

    const dtos = await hrisApiClient.get<PublicHolidayOverrideDTO[]>(
      `/public-holiday-calendars/${calendarId}/overrides${query}`
    );

    return publicHolidayMapper.mapPublicHolidayOverrideDTOs(dtos);
  }

  /** "Revert to Provider": the day becomes the provider's version again; leave under it is re-priced. */
  public async revertOverride(overrideId: string): Promise<PublicHolidayOverrideRevertResultDTO> {
    return hrisApiClient.post<PublicHolidayOverrideRevertResultDTO>(
      `/public-holiday-overrides/${overrideId}/revert`
    );
  }
}

export const hrisApiPublicHolidaysClient =
  new HrisApiPublicHolidaysClient();
