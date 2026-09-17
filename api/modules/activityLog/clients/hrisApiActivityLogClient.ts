import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { ActivityCatalogDTO, ActivityLogPageDTO } from "@/api/modules/activityLog/dto";
import type { ActivityLogFilters } from "@/models/activityLog";

export class HrisApiActivityLogClient {
  private readonly PATH = "/activity-logs";

  public async search(
    filters: ActivityLogFilters,
    cursor?: string | null,
    limit?: number,
  ): Promise<ActivityLogPageDTO> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    });
    if (cursor) params.set("cursor", cursor);
    if (limit) params.set("limit", String(limit));

    const query = params.toString();
    return hrisApiClient.get<ActivityLogPageDTO>(query ? `${this.PATH}?${query}` : this.PATH);
  }

  public async catalog(): Promise<ActivityCatalogDTO> {
    return hrisApiClient.get<ActivityCatalogDTO>(`${this.PATH}/catalog`);
  }

  /** The file, streamed. The same filter the screen is showing goes with it. */
  public async export(filters: ActivityLogFilters, format: string): Promise<Response> {
    const params = new URLSearchParams({ format });
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    });
    return hrisApiClient.fetch(`${this.PATH}/export?${params.toString()}`);
  }
}

export const hrisApiActivityLogClient = new HrisApiActivityLogClient();
