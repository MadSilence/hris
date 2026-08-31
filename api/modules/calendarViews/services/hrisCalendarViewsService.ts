import {
  hrisApiCalendarViewsClient,
  type CalendarViewUpsert,
} from "@/api/modules/calendarViews/clients";
import type { CalendarView } from "@/models/calendarView";

export class HrisCalendarViewsService {
  public list(): Promise<CalendarView[]> {
    return hrisApiCalendarViewsClient.list();
  }

  public create(body: CalendarViewUpsert): Promise<CalendarView> {
    return hrisApiCalendarViewsClient.create(body);
  }

  public update(id: string, body: CalendarViewUpsert): Promise<CalendarView> {
    return hrisApiCalendarViewsClient.update(id, body);
  }

  public remove(id: string): Promise<void> {
    return hrisApiCalendarViewsClient.remove(id);
  }
}

export const hrisCalendarViewsService = new HrisCalendarViewsService();
