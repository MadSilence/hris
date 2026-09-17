import type { ActivityLogFilters } from "@/models/activityLog";

export const logsQueryKeys = {
  all: ["activity-logs"] as const,
  catalog: () => [...logsQueryKeys.all, "catalog"] as const,
  /** The filters are part of the key: a filter change is a different list, not a refetch of this one. */
  list: (filters: ActivityLogFilters) => [...logsQueryKeys.all, "list", filters] as const,
};
