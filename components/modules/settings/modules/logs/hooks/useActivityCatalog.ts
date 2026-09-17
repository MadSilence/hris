import { useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { ActivityCatalog } from "@/models/activityLog";
import { logsQueryKeys } from "@/components/modules/settings/modules/logs/utils/logsQueryKeys";

/**
 * The filter vocabulary, from the backend.
 *
 * <p>It changes only when the product does — a deploy, not a session — so it is fetched once and kept.
 */
export const useActivityCatalog = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<ActivityCatalog>({
    queryKey: logsQueryKeys.catalog(),
    queryFn: () => internalApiClient.get<ActivityCatalog>("/activity-logs/catalog"),
    staleTime: Infinity,
  });
};
