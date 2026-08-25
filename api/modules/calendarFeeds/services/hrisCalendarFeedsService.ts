import { hrisApiCalendarFeedsClient } from "@/api/modules/calendarFeeds/clients";
import type { CalendarFeedDTO, CalendarFeedKind } from "@/api/modules/calendarFeeds/dto";

export class HrisCalendarFeedsService {
  public async list(): Promise<CalendarFeedDTO[]> {
    return hrisApiCalendarFeedsClient.list();
  }

  public async issue(kind: CalendarFeedKind, calendarId?: string | null): Promise<CalendarFeedDTO> {
    return hrisApiCalendarFeedsClient.issue(kind, calendarId);
  }

  public async rotate(kind: CalendarFeedKind, calendarId?: string | null): Promise<CalendarFeedDTO> {
    return hrisApiCalendarFeedsClient.rotate(kind, calendarId);
  }

  public async revoke(kind: CalendarFeedKind, calendarId?: string | null): Promise<void> {
    return hrisApiCalendarFeedsClient.revoke(kind, calendarId);
  }
}

export const hrisCalendarFeedsService = new HrisCalendarFeedsService();
