import { hrisApiActivityLogClient } from "@/api/modules/activityLog/clients";
import type { ActivityCatalog, ActivityLogFilters, ActivityLogPage } from "@/models/activityLog";

export class HrisActivityLogService {
  public async search(
    filters: ActivityLogFilters,
    cursor?: string | null,
    limit?: number,
  ): Promise<ActivityLogPage> {
    return hrisApiActivityLogClient.search(filters, cursor, limit);
  }

  public async catalog(): Promise<ActivityCatalog> {
    return hrisApiActivityLogClient.catalog();
  }

  public async export(filters: ActivityLogFilters, format: string): Promise<Response> {
    return hrisApiActivityLogClient.export(filters, format);
  }
}

export const hrisActivityLogService = new HrisActivityLogService();
