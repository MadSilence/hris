import type { PublicHoliday } from "@/models/publicHolidays/holiday";

export class PublicHolidaysService {
  public async list(calendarId: string): Promise<PublicHoliday[]> {
    const res = await fetch(
      `/api/public-holiday-calendars/${calendarId}/holidays`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to load public holidays");
    }

    return res.json();
  }
}

export const publicHolidaysService = new PublicHolidaysService();
