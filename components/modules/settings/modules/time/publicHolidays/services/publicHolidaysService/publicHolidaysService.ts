import { internalApiClient } from "@/components/clients/apiClient";
import type { PublicHoliday } from "@/models/publicHolidays/holiday";

export class PublicHolidaysService {
  public async list(calendarId: string, year?: number): Promise<PublicHoliday[]> {
    const query = year ? `?year=${year}` : "";

    return internalApiClient.get<PublicHoliday[]>(
      `/public-holiday/calendars/${calendarId}/holidays${query}`,
    );
  }
}

export const publicHolidaysService = new PublicHolidaysService();
