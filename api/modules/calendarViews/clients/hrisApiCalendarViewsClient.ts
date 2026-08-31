import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { CalendarView, CalendarViewPayload } from "@/models/calendarView";

export type CalendarViewUpsert = { name: string; payload: CalendarViewPayload };

export class HrisApiCalendarViewsClient {
  private readonly BASE_PATH = "/calendar-views";

  public list(): Promise<CalendarView[]> {
    return hrisApiClient.get<CalendarView[]>(this.BASE_PATH);
  }

  public create(body: CalendarViewUpsert): Promise<CalendarView> {
    return hrisApiClient.post<CalendarView>(`${this.BASE_PATH}/create`, {
      name: body.name,
      payload: body.payload,
    });
  }

  public update(id: string, body: CalendarViewUpsert): Promise<CalendarView> {
    return hrisApiClient.patch<CalendarView, CalendarViewUpsert>(`${this.BASE_PATH}/${id}`, body);
  }

  public remove(id: string): Promise<void> {
    return hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/delete`);
  }
}

export const hrisApiCalendarViewsClient = new HrisApiCalendarViewsClient();
