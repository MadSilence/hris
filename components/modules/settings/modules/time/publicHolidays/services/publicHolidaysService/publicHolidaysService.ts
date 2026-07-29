import { internalApiClient } from "@/components/clients/apiClient";
import type { PublicHoliday } from "@/models/publicHolidays/holiday";

export class PublicHolidaysService {
  public async list(calendarId: string): Promise<PublicHoliday[]> {
    return internalApiClient.get<PublicHoliday[]>(
      `/public-holiday/calendars/${calendarId}/holidays`,
    );
  }
}

export const publicHolidaysService = new PublicHolidaysService();
