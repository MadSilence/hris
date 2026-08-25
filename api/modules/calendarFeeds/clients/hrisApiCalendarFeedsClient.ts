import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { CalendarFeedDTO, CalendarFeedKind } from "@/api/modules/calendarFeeds/dto";

export class HrisApiCalendarFeedsClient {
  private readonly BASE_PATH = "/calendar-feeds";

  public async list(): Promise<CalendarFeedDTO[]> {
    return hrisApiClient.get<CalendarFeedDTO[]>(this.BASE_PATH);
  }

  public async issue(kind: CalendarFeedKind, calendarId?: string | null): Promise<CalendarFeedDTO> {
    return hrisApiClient.post<CalendarFeedDTO>(`${this.BASE_PATH}?${query(kind, calendarId)}`);
  }

  public async rotate(kind: CalendarFeedKind, calendarId?: string | null): Promise<CalendarFeedDTO> {
    return hrisApiClient.post<CalendarFeedDTO>(`${this.BASE_PATH}/rotate?${query(kind, calendarId)}`);
  }

  public async revoke(kind: CalendarFeedKind, calendarId?: string | null): Promise<void> {
    return hrisApiClient.post<void>(`${this.BASE_PATH}/revoke?${query(kind, calendarId)}`);
  }
}

const query = (kind: CalendarFeedKind, calendarId?: string | null) => {
  const params = new URLSearchParams({ kind });
  if (calendarId) params.set("calendarId", calendarId);
  return params.toString();
};

export const hrisApiCalendarFeedsClient = new HrisApiCalendarFeedsClient();
