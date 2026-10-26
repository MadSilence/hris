import { internalApiClient } from "@/components/clients/apiClient";
import type { PublicHoliday, PublicHolidayOverride } from "@/models/publicHolidays/holiday";

export class PublicHolidaysService {
  public async list(calendarId: string, year?: number): Promise<PublicHoliday[]> {
    const query = year ? `?year=${year}` : "";

    return internalApiClient.get<PublicHoliday[]>(
      `/public-holiday/calendars/${calendarId}/holidays${query}`,
    );
  }

  /** The company's overrides of the provider's days in that year. */
  public async listOverrides(calendarId: string, year?: number): Promise<PublicHolidayOverride[]> {
    const query = year ? `?year=${year}` : "";

    return internalApiClient.get<PublicHolidayOverride[]>(
      `/public-holiday/calendars/${calendarId}/overrides${query}`,
    );
  }
}

export const publicHolidaysService = new PublicHolidaysService();
