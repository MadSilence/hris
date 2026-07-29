import { internalApiClient } from "@/components/clients/apiClient";
import type { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";

export class PublicHolidayCalendarsService {
  public async list(): Promise<PublicHolidayCalendar[]> {
    return internalApiClient.get<PublicHolidayCalendar[]>("/public-holiday/calendars");
  }

  public async getById(id: string): Promise<PublicHolidayCalendar> {
    return internalApiClient.get<PublicHolidayCalendar>(`/public-holiday/calendars/${id}`);
  }
}

export const publicHolidayCalendarsService =
  new PublicHolidayCalendarsService();
