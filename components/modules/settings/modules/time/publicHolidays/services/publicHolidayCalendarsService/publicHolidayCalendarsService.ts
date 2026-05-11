import type { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";

export class PublicHolidayCalendarsService {
  public async list(): Promise<PublicHolidayCalendar[]> {
    const res = await fetch("/api/public-holiday-calendars", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load public holiday calendars");
    }

    return res.json();
  }

  public async getById(id: string): Promise<PublicHolidayCalendar> {
    const res = await fetch(`/api/public-holiday-calendars/${id}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load public holiday calendar");
    }

    return res.json();
  }
}

export const publicHolidayCalendarsService =
  new PublicHolidayCalendarsService();
